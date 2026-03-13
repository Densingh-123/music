import CryptoJS from 'crypto-js';

export const decodeSaavnUrl = (input: string): string => {
  if (!input) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse(process.env.EXPO_PUBLIC_SAAVN_DES_KEY || '38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(input) } as any,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    let decoded = decrypted.toString(CryptoJS.enc.Utf8);
    decoded = decoded.replace(/\.mp4.*/, '.mp4').replace(/\.m4a.*/, '.m4a');
    return decoded.replace('http:', 'https:');
  } catch (e) {
    console.warn('Failed to decode Saavn URL', e);
    return '';
  }
};

export interface LyricLine {
  time: number;
  text: string;
}

export interface LyricsData {
  plain: string;
  synced: LyricLine[];
}

export interface SongItem {
  id: string; // Saavn track ID
  title: string;
  artist: string;
  artworkUrl: string;
  album?: string;
  streamUrl?: string;     // The Saavn decoded URL (30s preview or sometimes full)
  fullStreamUrl?: string; // The YouTube full stream
}

// Base URLs — configured via .env (EXPO_PUBLIC_ prefix makes them available in the client bundle)
const CORS_PROXY = process.env.EXPO_PUBLIC_CORS_PROXY || 'https://api.codetabs.com/v1/proxy/?quest=';
const PIPED_API_BASE = process.env.EXPO_PUBLIC_PIPED_API_BASE || 'https://pipedapi.kavin.rocks';
const SAAVN_API_BASE = process.env.EXPO_PUBLIC_SAAVN_API_BASE || 'https://www.jiosaavn.com/api.php';
const LRCLIB_API_BASE = process.env.EXPO_PUBLIC_LRCLIB_API_BASE || 'https://lrclib.net/api';

const IS_WEB = typeof window !== 'undefined';
const APP_PLATFORM = IS_WEB ? 'web' : 'native';



// Helper to fetch the actual audio stream URL via Piped API
export const getStreamUrl = async (videoId: string): Promise<string | null> => {
  try {
    
    let url = `${PIPED_API_BASE}/streams/${videoId}`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const pDataRes = await fetch(url);
    if (!pDataRes.ok) return null;
    
    const pData = await pDataRes.json();
    const audioStreams = pData.audioStreams || [];
    const bestAudio = audioStreams.find((s: any) =>
      s.mimeType && (s.mimeType.includes('mp4') || s.mimeType.includes('m4a'))
    ) || audioStreams[0];
    return bestAudio?.url || null;
  } catch (e) {
    console.error("Failed to fetch stream URL", e);
    return null;
  }
};

// Top-level function used by Player to resolve full-length streams
export const getFullStreamUrl = async (title: string, artist: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${title} ${artist} audio`);
    let url = `${PIPED_API_BASE}/search?q=${query}&filter=music_songs`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const searchRes = await fetch(url);
    if (!searchRes.ok) return null;
    
    let searchData = await searchRes.json();
    const topResult = searchData?.items?.[0];
    const videoId = topResult?.url?.split('v=')?.[1] || topResult?.url?.split('/')?.pop();
    
    if (!videoId) return null;
    
    return await getStreamUrl(videoId);
  } catch (error) {
    console.warn('Resolution failed:', error);
    return null;
  }
};

export const getYoutubeId = async (title: string, artist: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    let url = `${PIPED_API_BASE}/search?q=${query}&filter=videos`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    const topResult = data?.items?.[0];
    return topResult?.url?.split('v=')?.[1] || topResult?.url?.split('/')?.pop() || null;
  } catch (e) {
    return null;
  }
};

const unescapeHtml = (safe: string) => {
  if (!safe) return '';
  return safe.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&apos;/g, "'");
};

const getHighResImage = (url: string) => {
  if (!url) return '';
  return url.replace('50x50', '500x500').replace('150x150', '500x500').replace('http:', 'https:');
};

export const fetchTrending = async (): Promise<SongItem[]> => {
  try {
    const query = encodeURIComponent('tamil hits');
    let url = `${SAAVN_API_BASE}?p=1&q=${query}&_format=json&_marker=0&ctx=wap6dot0&n=40&__call=search.getResults`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Saavn fetch failed');
    const data = await res.json();
    let results = data.results || [];
    
    // Sometimes Saavn returns an object of objects instead of an array
    if (typeof results === 'object' && !Array.isArray(results)) {
      results = Object.values(results);
    }
    
    return results.map((track: any) => ({
      id: track.id,
      title: unescapeHtml(track.title || track.song),
      artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Unknown Artist'),
      artworkUrl: getHighResImage(track.image),
      streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
    }));
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const searchMusic = async (query: string, offset: number = 0): Promise<SongItem[]> => {
  if (!query) return [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const page = Math.floor(offset / 20) + 1;
    let url = `${SAAVN_API_BASE}?p=${page}&q=${encodedQuery}&_format=json&_marker=0&ctx=wap6dot0&n=20&__call=search.getResults`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Saavn search failed');
    const data = await res.json();
    let results = data.results || [];
    
    if (typeof results === 'object' && !Array.isArray(results)) {
      results = Object.values(results);
    }
    
    return results.map((track: any) => ({
      id: track.id,
      title: unescapeHtml(track.title || track.song),
      artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Unknown Artist'),
      artworkUrl: getHighResImage(track.image),
      streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
    }));
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};

export const fetchRingtones = async (): Promise<SongItem[]> => {
  try {
    const query = encodeURIComponent('instrumental ringtones');
    let url = `${SAAVN_API_BASE}?p=1&q=${query}&_format=json&_marker=0&ctx=wap6dot0&n=30&__call=search.getResults`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Saavn fetch failed');
    const data = await res.json();
    let results = data.results || [];
    
    if (typeof results === 'object' && !Array.isArray(results)) {
      results = Object.values(results);
    }
    
    return results.map((track: any) => ({
      id: track.id,
      title: unescapeHtml(track.title || track.song).replace(' (Ringtone)', '').replace(' Ringtone', ''),
      artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Ringtone'),
      artworkUrl: getHighResImage(track.image),
      streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
    }));
  } catch (error) {
    console.error('Error fetching ringtones:', error);
    return [];
  }
};
export const searchRingtones = async (query: string): Promise<SongItem[]> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    let url = `${SAAVN_API_BASE}?p=1&q=${encodedQuery}&_format=json&_marker=0&ctx=wap6dot0&n=30&__call=search.getResults`;
    if (APP_PLATFORM === 'web') url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Saavn fetch failed');
    const data = await res.json();
    let results = data.results || [];
    
    if (typeof results === 'object' && !Array.isArray(results)) {
      results = Object.values(results);
    }
    
    return results.map((track: any) => ({
      id: track.id,
      title: unescapeHtml(track.title || track.song).replace(' (Ringtone)', '').replace(' Ringtone', ''),
      artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Ringtone'),
      artworkUrl: getHighResImage(track.image),
      streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
    }));
  } catch (error) {
    console.error('Error searching ringtones:', error);
    return [];
  }
};

export const getLyrics = async (id: string, title?: string, artist?: string, album?: string, duration?: number): Promise<LyricsData> => {
  try {
    // Try LRCLib first for synced lyrics if we have enough metadata
    if (title && artist) {
      const lrcLibData = await getLyricsLRCLib(title, artist, album, duration);
      if (lrcLibData) return lrcLibData;
    }

    // Fallback to Piped API using resolved YouTube ID
    const ytId = (title && artist) ? await getYoutubeId(title, artist) : id;
    if (!ytId) return { plain: "No lyrics available.", synced: [] };

    let url = `${PIPED_API_BASE}/lyrics/${ytId}`;
    if (APP_PLATFORM === 'web') {
      url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    }
    const res = await fetch(url);
    if (!res.ok) return { plain: "No lyrics available.", synced: [] };
    
    const data = await res.json();
    if (Array.isArray(data.lines)) {
      const synced = data.lines.map((line: any) => ({
        time: line.startTimeMs / 1000,
        text: line.words || line.content || ""
      }));
      return {
        plain: synced.map((l: any) => l.text).join('\n'),
        synced
      };
    }
    
    return { plain: "No lyrics available.", synced: [] };
  } catch (e) {
    console.warn("Lyrics fetch failed:", e);
    return { plain: "Error loading lyrics.", synced: [] };
  }
};

const getLyricsLRCLib = async (
  title: string,
  artist: string,
  album?: string,
  duration?: number
): Promise<LyricsData | null> => {
  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    });
    if (album) params.append('album_name', album);
    if (duration) params.append('duration', Math.round(duration).toString());

    let url = `${LRCLIB_API_BASE}/get?${params.toString()}`;
    // lrclib.net supports CORS, no proxy needed for web if it's acting up

    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return {
        plain: data.plainLyrics || "",
        synced: parseLRC(data.syncedLyrics || data.plainLyrics || "")
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const parseLRC = (lrc: string): LyricLine[] => {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3]);
      const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });

  return result.sort((a, b) => a.time - b.time);
};
