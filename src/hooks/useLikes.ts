import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { SongItem } from '../services/api';

export function useLikes() {
  const [likedSongs, setLikedSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLikedSongs([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'likedSongs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map(doc => doc.data() as SongItem);
      setLikedSongs(songs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const toggleLike = async (song: SongItem) => {
    if (!user) return;
    
    const songRef = doc(db, 'users', user.uid, 'likedSongs', song.id);
    const isAlreadyLiked = likedSongs.some(s => s.id === song.id);

    try {
      if (isAlreadyLiked) {
        await deleteDoc(songRef);
      } else {
        await setDoc(songRef, song);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  return { likedSongs, toggleLike, isLiked, loading };
}
