/**
 * MusicPlayerService (Using react-native-track-player)
 */

import TrackPlayer, { State } from 'react-native-track-player';
import { SongItem, getFullStreamUrl } from './api';

const SILENT_DUMMY = 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3';

export interface PlayOptions {
  track: SongItem;
  queue: SongItem[];
  /** Called with `true` while resolving, `false` when done */
  onLoading?: (loading: boolean) => void;
  /** Called when an error occurs */
  onError?: (message: string) => void;
  /** If true, skip resolution and use the provide streamUrl directly (for 30s ringtones) */
  isRingtone?: boolean;
}

/**
 * Convert a SongItem to a TrackPlayer Track.
 * The URL may be a dummy — `playTrack` will resolve it before playing.
 */
const toTrackPlayerItem = (song: SongItem, resolvedUrl?: string) => ({
  id: song.id,
  url: resolvedUrl ?? song.streamUrl ?? SILENT_DUMMY,
  title: song.title,
  artist: song.artist,
  artwork: song.artworkUrl,
});

/**
 * Checks if a URL is a dummy / unresolved placeholder.
 */
const isDummy = (url?: string): boolean =>
  !url || url === 'pending' || url.includes('pixabay') || url.includes('samplelib');

/**
 * Resolve the real audio stream URL for a song.
 * Mirrors Flutter's AudioSourceManager.getAudioSource() using Piped API.
 */
export const resolveStreamUrl = async (song: SongItem, isRingtone?: boolean): Promise<string | null> => {
  // If it's already a local file URI, use it directly
  if (song.streamUrl?.startsWith('file://')) {
    return song.streamUrl;
  }

  // For ringtones, we strictly use the 30s preview URL from Saavn
  if (isRingtone && song.streamUrl && !isDummy(song.streamUrl)) {
    return song.streamUrl;
  }

  // Always try to fetch full stream from Piped API (YouTube)
  const fullUrl = await getFullStreamUrl(song.title, song.artist);
  if (fullUrl && !isDummy(fullUrl)) {
    return fullUrl;
  }
  
  // Fallback to Saavn stream (30s preview or full)
  if (song.streamUrl && !isDummy(song.streamUrl)) {
    return song.streamUrl;
  }
  return null;
};

/**
 * Main play function — call this from any screen when the user taps a song.
 */
export const playTrack = async ({
  track,
  queue,
  onLoading,
  onError,
  isRingtone,
}: PlayOptions): Promise<boolean> => {
  try {
    onLoading?.(true);

    // Step 1: Resolve the real stream URL for the clicked track
    const realUrl = await resolveStreamUrl(track, isRingtone);
    if (!realUrl) {
      onError?.('Could not find audio stream for this track.');
      onLoading?.(false);
      return false;
    }

    // Step 2: Reset and prepare the queue
    await TrackPlayer.reset();
    
    // Convert all items in queue (some will be dummies)
    const tpQueue = queue.map(s => {
      if (s.id === track.id) {
        return toTrackPlayerItem(s, realUrl);
      }
      return toTrackPlayerItem(s);
    });

    await TrackPlayer.add(tpQueue);

    // Step 3: Find the index and skip to it
    const index = tpQueue.findIndex(t => t.id === track.id);
    if (index !== -1) {
      await TrackPlayer.skip(index);
    }

    // Step 4: Start playback
    await TrackPlayer.play();

    onLoading?.(false);
    return true;
  } catch (err) {
    console.error('[MusicPlayerService] playTrack error:', err);
    onError?.('Playback error.');
    onLoading?.(false);
    return false;
  }
};

/**
 * Called by PlayerScreen when the active track changes and its URL is still a dummy.
 */
export const resolveAndResumeTrack = async (activeTrack: any): Promise<void> => {
  if (!activeTrack || !isDummy(activeTrack.url)) return;

  try {
    const realUrl = await resolveStreamUrl({
      id: activeTrack.id,
      title: activeTrack.title,
      artist: activeTrack.artist,
      artworkUrl: activeTrack.artwork,
    } as SongItem);

    if (realUrl) {
      const state = await TrackPlayer.getState();
      const currentPos = await TrackPlayer.getPosition();
      
      // Update the track in the queue with the new URL
      // Since RNTP doesn't have a direct 'updateTrack' we might have to be creative 
      // or rely on the user tapping the track again if it fails.
      // But for v4, we can use TrackPlayer.load() or similar if available.
      // For now, we'll just log it.
      console.log('Resolved URL for next track:', realUrl);
    }
  } catch (e) {
    console.warn('Background resolution failed', e);
  }
};

export default {
  playTrack,
  resolveStreamUrl,
  resolveAndResumeTrack,
};
