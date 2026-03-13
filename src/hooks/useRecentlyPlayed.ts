import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { SongItem } from '../services/api';

export const useRecentlyPlayed = (limitCount = 10) => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnap: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
      // Clean up previous Firestore listener when auth state changes
      if (unsubscribeSnap) {
        unsubscribeSnap();
        unsubscribeSnap = null;
      }

      if (!user) {
        setRecentlyPlayed([]);
        setLoading(false);
        return;
      }

      // Primary query with ordering (requires composite index)
      const q = query(
        collection(db, 'recentlyPlayed'),
        where('userId', '==', user.uid),
        orderBy('playedAt', 'desc'),
        limit(limitCount)
      );

      unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.songId,
            title: data.title,
            artist: data.artist,
            artworkUrl: data.artworkUrl,
            streamUrl: data.streamUrl,
          } as SongItem;
        });
        setRecentlyPlayed(list);
        setLoading(false);
      }, (err) => {
        // Fallback: If composite index isn't created, use simpler query
        if (err.message?.includes('index')) {
          const fallbackQ = query(
            collection(db, 'recentlyPlayed'),
            where('userId', '==', user.uid),
            limit(limitCount)
          );
          unsubscribeSnap = onSnapshot(fallbackQ, (snap) => {
            const list = snap.docs.map(doc => {
              const data = doc.data();
              return {
                id: data.songId,
                title: data.title,
                artist: data.artist,
                artworkUrl: data.artworkUrl,
                streamUrl: data.streamUrl,
              } as SongItem;
            });
            setRecentlyPlayed(list);
            setLoading(false);
          }, () => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) unsubscribeSnap();
    };
  }, [limitCount]);

  return { recentlyPlayed, loading };
};
