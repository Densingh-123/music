import { auth, db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, orderBy, limit } from 'firebase/firestore';

export const trackRecentlyPlayed = async (song: {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  streamUrl: string;
}) => {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const recentlyPlayedRef = collection(db, 'recentlyPlayed');

  try {
    // Optional: Remove existing entry for the same song to keep it unique and at the top
    const q = query(
      recentlyPlayedRef, 
      where('userId', '==', userId), 
      where('songId', '==', song.id)
    );
    const existingDocs = await getDocs(q);
    
    // In a production app, you might want to batched update. 
    // Here we just add a new entry for simplicity as per the "Recently Played" requirement.
    // But let's delete old ones to keep history clean
    for (const d of existingDocs.docs) {
      await deleteDoc(d.ref);
    }

    await addDoc(recentlyPlayedRef, {
      userId,
      songId: song.id,
      title: song.title,
      artist: song.artist,
      artworkUrl: song.artworkUrl,
      streamUrl: song.streamUrl,
      playedAt: serverTimestamp(),
    });

    // Optional: Limit total history to 50 items
  } catch (error) {
    console.error("Error tracking recently played:", error);
  }
};
