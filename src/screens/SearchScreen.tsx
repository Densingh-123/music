import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Image,
  Pressable, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import SkeletonLoader from '@/src/components/ui/SkeletonLoader';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchMusic } from '@/src/hooks/useMusicData';
import { useDebounce } from '@/src/utils/useDebounce';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import { SongItem } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { trackRecentlyPlayed } from '@/src/services/musicService';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import { useAuth } from '@/src/theme/AuthContext';

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const routeParams = route.params as { query?: string } | undefined;
  const [query, setQuery] = useState(routeParams?.query || '');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // Update query if route params change
  React.useEffect(() => {
    if (routeParams?.query) {
      setQuery(routeParams.query);
    }
  }, [routeParams?.query]);

  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchMusic(debouncedQuery);
  const results: SongItem[] = data?.pages.flatMap(p => p) || [];

  const isTablet = width >= 600;
  const isDesktop = width >= 900;

  const handlePlay = async (track: SongItem, index: number) => {
    if (!user) {
      import('react-native').then(({ Alert }) => {
        Alert.alert('Login Required', 'Please login to listen to full tracks and save your progress.');
      });
      navigation.navigate('Login' as never);
      return;
    }
    setPlayingId(track.id);
    const success = await MusicPlayerService.playTrack({
      track,
      queue: results,
      onLoading: (loading) => { if (!loading) setPlayingId(null); },
      onError: (msg) => {
        import('react-native').then(({ Alert }) => Alert.alert('Playback Error', msg));
        setPlayingId(null);
      },
    });
    if (success) {
      trackRecentlyPlayed({
        ...track,
        streamUrl: track.streamUrl ?? '',
      });
      navigation.navigate('Player' as never);
    }
  };

  const handleOpenPicker = () => {
    setOptionsVisible(false);
    setPickerVisible(true);
  };

  const handleOpenOptions = (track: SongItem) => {
    setSelectedSong(track);
    setOptionsVisible(true);
  };

  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  const renderItem = ({ item, index }: { item: SongItem; index: number }) => {
    if (numColumns > 1) {
      // Grid Card for Tablet/Desktop
      const cardWidth = (width - 80 - (numColumns - 1) * 16) / numColumns; // Reduced width
      return (
        <View style={[styles.gridCardWrapper, { width: cardWidth }]}>
          <Pressable onPress={() => handlePlay(item, index)}>
            {({ pressed }) => (
              <View style={styles.fullImageCard}>
                <Image source={{ uri: item.artworkUrl }} style={styles.fullImage} />
                <LinearGradient
                  colors={
                    pressed 
                      ? ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']
                      : ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']
                  }
                  locations={[0, 0.5, 1]}
                  style={styles.darkOverlay}
                >
                  {playingId === item.id && (
                    <ActivityIndicator color="#fff" style={{ position: 'absolute', top: '40%' }} />
                  )}
                  <View style={[
                    styles.hoverTextContainer,
                    { opacity: pressed ? 1 : 0.4 }
                  ]}>
                    <Text style={styles.fullCardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.fullCardArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <View style={styles.fullCardActions}>
                    <Pressable onPress={() => handleOpenOptions(item)} hitSlop={8}>
                      <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
                    </Pressable>
                    {playingId !== item.id && (
                      <Ionicons name="play" size={18} color={theme.colors.primary} />
                    )}
                  </View>
                </LinearGradient>
              </View>
            )}
          </Pressable>
        </View>
      );
    }

    // Row for Mobile — full-image background card
    return (
      <View style={styles.resultRowWrapper}>
        <Pressable onPress={() => handlePlay(item, index)}>
          {({ pressed }) => (
            <View style={styles.fullImageRow}>
              <Image source={{ uri: item.artworkUrl }} style={styles.fullImageRowBg} />
              <LinearGradient
                colors={
                  pressed 
                    ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.82)']
                    : ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']
                }
                locations={[0, 0.45, 1]}
                style={styles.darkOverlayRow}
              >
                {playingId === item.id && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
                <View style={[
                  styles.hoverRowText,
                  { opacity: pressed ? 1 : 0.35 }
                ]}>
                  <Text style={styles.fullRowTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.fullRowArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
                <View style={styles.rowActionsCompact}>
                  <Pressable onPress={() => handleOpenOptions(item)} hitSlop={8}>
                    <Ionicons name="ellipsis-vertical" size={18} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                  {playingId !== item.id && (
                    <Ionicons name="play" size={18} color={theme.colors.primary} />
                  )}
                </View>
              </LinearGradient>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.glassBorder }]}>
        <Ionicons name="search" size={24} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.text, outline: 'none' } as any]}
          placeholder="Artists, songs, or podcasts"
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Loading Skeletons */}
      {isLoading && (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonLoader key={i} height={72} style={{ marginBottom: 10, borderRadius: 12 }} />
          ))}
        </View>
      )}

      {/* Empty State */}
      {!isLoading && query.length > 0 && results.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={52} color={theme.colors.textSecondary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 12, fontSize: 16 }}>
            No results found for "{query}"
          </Text>
        </View>
      )}

      {/* No Query prompt */}
      {!isLoading && query.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-circle-outline" size={64} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 12, fontSize: 16 }}>
            Search for any song or artist
          </Text>
        </View>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <FlatList
          data={results}
          key={numColumns} // force re-render when columns change
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
              : null
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
        onAddToPlaylist={handleOpenPicker}
      />
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 60, // Made it big
    borderRadius: 30,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 28, // Narrower content for reduced card width
  },
  // === Full-Image Row (Mobile) ===
  resultRowWrapper: {
    marginBottom: 16,
  },
  fullImageRow: {
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  fullImageRowBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  darkOverlayRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 14,
  },
  hoverRowText: {
    flex: 1,
    gap: 3,
  },
  fullRowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.1,
  },
  fullRowArtist: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  rowActionsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // === Full-Image Grid Card (Tablet/Desktop) ===
  gridCardWrapper: {
    padding: 10,
    marginBottom: 14,
  },
  fullImageCard: {
    height: 260,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  fullImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  hoverTextContainer: {
    gap: 4,
    marginBottom: 4,
  },
  fullCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.1,
  },
  fullCardArtist: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  fullCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
});
