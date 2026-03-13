import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  songs: any[];
  color: string;
  icon: string;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'playlists'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];
      setPlaylists(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching playlists:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createPlaylist = async (name: string) => {
    if (!auth.currentUser) return;
    
    // Random vibrant colors
    const colors = ['#e91e63', '#673ab7', '#ff5722', '#009688', '#f57f17', '#6200ea', '#2196f3'];
    const icons = ['musical-notes', 'heart', 'headset', 'disc', 'radio', 'star', 'planet'];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    await addDoc(collection(db, 'playlists'), {
      name,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      songs: [],
      color: randomColor,
      icon: randomIcon,
    });
  };

  const addSongToPlaylist = async (playlistId: string, song: any) => {
    const playlistRef = doc(db, 'playlists', playlistId);
    await updateDoc(playlistRef, {
      songs: arrayUnion(song)
    });
  };

  return { playlists, loading, createPlaylist, addSongToPlaylist };
};
