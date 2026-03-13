import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { SongItem, getStreamUrl } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOAD_META_KEY = 'downloaded_songs_metadata';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export interface DownloadProgress {
  id: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
}

class DownloadService {
  private static instance: DownloadService;
  private downloads: Map<string, FileSystem.DownloadResumable> = new Map();

  private constructor() {
    this.ensureDirExists();
  }

  static getInstance() {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  private async ensureDirExists() {
    if (Platform.OS === 'web') return;
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }
  }

  async downloadSong(song: SongItem, onProgress?: (p: number) => void): Promise<string | null> {
    if (Platform.OS === 'web') {
      alert("Downloads are not supported on web. Use a mobile device.");
      return null;
    }
    try {
      // 1. Resolve full stream URL if not present
      let url: string | undefined = song.streamUrl;
      if (!url || url.includes('preview')) {
        const streamUrl = await getStreamUrl(song.id);
        url = streamUrl || undefined;
      }

      if (!url) throw new Error("Could not resolve stream URL");

      const fileExtension = url.includes('m4a') ? 'm4a' : 'mp3';
      const fileName = `${song.id}.${fileExtension}`;
      const fileUri = `${DOWNLOAD_DIR}${fileName}`;

      // Check if already downloaded
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        return fileUri;
      }

      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress);
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        callback
      );

      this.downloads.set(song.id, downloadResumable);
      
      const result = await downloadResumable.downloadAsync();
      this.downloads.delete(song.id);

      if (result && result.uri) {
        // Save metadata to AsyncStorage
        await this.saveMetadata(song);
        return result.uri;
      }
      return null;
    } catch (error) {
      console.error("Download failed:", error);
      this.downloads.delete(song.id);
      return null;
    }
  }

  async getDownloadedFile(songId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    const extensions = ['m4a', 'mp3'];
    for (const ext of extensions) {
      const fileUri = `${DOWNLOAD_DIR}${songId}.${ext}`;
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) return fileUri;
    }
    return null;
  }

  async deleteDownload(songId: string) {
    if (Platform.OS === 'web') return;
    const fileUri = await this.getDownloadedFile(songId);
    if (fileUri) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
    await this.removeMetadata(songId);
  }

  private async saveMetadata(song: SongItem) {
    const list = await this.getAllMetadata();
    if (!list.find(s => s.id === song.id)) {
      list.push(song);
      await AsyncStorage.setItem(DOWNLOAD_META_KEY, JSON.stringify(list));
    }
  }

  private async removeMetadata(songId: string) {
    const list = await this.getAllMetadata();
    const filtered = list.filter(s => s.id !== songId);
    await AsyncStorage.setItem(DOWNLOAD_META_KEY, JSON.stringify(filtered));
  }

  async getAllMetadata(): Promise<SongItem[]> {
    const data = await AsyncStorage.getItem(DOWNLOAD_META_KEY);
    return data ? JSON.parse(data) : [];
  }
}

export default DownloadService.getInstance();
