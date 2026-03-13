import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  Image, Pressable, useWindowDimensions, Alert 
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DownloadService from '@/src/services/DownloadService';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { SongItem } from '@/src/services/api';

export default function DownloadsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    const downloaded = await DownloadService.getAllMetadata();
    setSongs(downloaded);
    setLoading(false);
  };

  const handlePlayOffline = async (song: SongItem) => {
    const fileUri = await DownloadService.getDownloadedFile(song.id);
    if (!fileUri) {
      Alert.alert('Error', 'File not found locally.');
      return;
    }

    setPlayingId(song.id);
    // Note: MusicPlayerService.playTrack needs adjustment to handle file URIs 
    // or we pass the local URI in streamUrl
    const success = await MusicPlayerService.playTrack({
      track: { ...song, streamUrl: fileUri },
      queue: songs,
      onLoading: (isLoading) => { if (!isLoading) setPlayingId(null); },
      onError: (msg) => {
        Alert.alert('Playback Error', msg);
        setPlayingId(null);
      }
    });
    if (!success) setPlayingId(null);
  };

  const handleDelete = (song: SongItem) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to remove "${song.title}" from your offline library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await DownloadService.deleteDownload(song.id);
            loadDownloads();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: SongItem }) => (
    <GlassCard intensity={20} style={styles.songCard}>
      <Pressable onPress={() => handlePlayOffline(item)} style={styles.cardInner}>
        <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={[styles.titleText, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.artistText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
        </View>
        <View style={styles.actions}>
          {playingId === item.id ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : (
            <Ionicons name="play-circle" size={32} color={theme.colors.primary} />
          )}
          <Pressable onPress={() => handleDelete(item)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </Pressable>
    </GlassCard>
  );

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + (width >= 900 ? 80 : 16) }]}>
        <View style={styles.titleWrapper}>
          <Ionicons name="download" size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Offline Library</Text>
        </View>
        <Text style={[styles.count, { color: theme.colors.textSecondary }]}>{songs.length} songs</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cloud-download-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No downloaded songs yet</Text>
          <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>Downloaded songs will appear here for offline listening</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySub: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  songCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  artistText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteBtn: {
    padding: 8,
  }
});
