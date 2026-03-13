import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  Image, Pressable, useWindowDimensions, Alert, TextInput 
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchRingtones, searchRingtones } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { useLikes } from '@/src/hooks/useLikes';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import { useDebounce } from '@/src/utils/useDebounce';

export default function RingtoneScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { toggleLike, isLiked } = useLikes();
  
  const [ringtones, setRingtones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 600);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const numColumns = width > 900 ? 5 : width > 600 ? 3 : 1;

  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      handleRemoteSearch(debouncedSearch);
    } else {
      loadData();
    }
  }, [debouncedSearch]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRingtones();
    setRingtones(data);
    setLoading(false);
  };

  const handleRemoteSearch = async (query: string) => {
    setLoading(true);
    const data = await searchRingtones(query);
    setRingtones(data);
    setLoading(false);
  };

  const handlePlay = async (track: any) => {
    setPlayingId(track.id);
    const success = await MusicPlayerService.playTrack({
      track,
      queue: ringtones,
      isRingtone: true, // Force 30s preview endpoint
      onLoading: (isLoading) => { if (!isLoading) setPlayingId(null); },
      onError: (msg) => {
        Alert.alert('Playback Error', msg);
        setPlayingId(null);
      }
    });
    if (!success) setPlayingId(null);
  };

  const handleOpenOptions = (track: any) => {
    setSelectedSong(track);
    setOptionsVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemContainer, { width: `${100/numColumns}%` as any }]}>
      <GlassCard intensity={20} style={styles.ringtoneCard}>
        <Pressable onPress={() => handlePlay(item)} style={styles.artworkWrapper}>
          <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
          <View style={[styles.playOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            {playingId === item.id ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Ionicons name="play" size={30} color="#fff" />
            )}
          </View>
        </Pressable>
        
        <View style={styles.info}>
          <Text style={[styles.trackTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.trackArtist, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => toggleLike(item)} style={styles.actionBtn}>
            <Ionicons 
              name={isLiked(item.id) ? "heart" : "heart-outline"} 
              size={22} 
              color={isLiked(item.id) ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </Pressable>
          <Pressable onPress={() => handleOpenOptions(item)} style={styles.actionBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </GlassCard>
    </View>
  );

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + (width >= 900 ? 50 : 16) }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Ringtones</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Premium 30s clips for your phone</Text>
          </View>
          <Pressable onPress={loadData} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>

        <GlassCard intensity={30} style={[styles.searchBarContainer, { borderColor: theme.colors.glassBorder }]}>
          <View style={styles.searchBarInner}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text, outline: 'none' } as any]}
              placeholder="Search any ringtone..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </GlassCard>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={ringtones}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          key={`ring-${numColumns}`}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No ringtones found for "{searchQuery}"</Text>
            </View>
          }
        />
      )}

      <PlaylistPickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          song={selectedSong}
        />
        <SongOptionsMenu
          visible={optionsVisible}
          onClose={() => setOptionsVisible(false)}
          song={selectedSong}
          onAddToPlaylist={() => {
            setOptionsVisible(false);
            setPickerVisible(true);
          }}
        />
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBarContainer: {
    borderRadius: 25,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  itemContainer: {
    padding: 10,
  },
  ringtoneCard: {
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  artworkWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  }
});
