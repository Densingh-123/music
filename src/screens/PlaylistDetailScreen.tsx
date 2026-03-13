import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, Pressable,
  ActivityIndicator, Alert, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSearchMusic } from '@/src/hooks/useMusicData';
import TrackPlayer from 'react-native-track-player';
import { SongItem } from '@/src/services/api';
import { useLikes } from '@/src/hooks/useLikes';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import { useAuth } from '@/src/theme/AuthContext';

type PlaylistDetailRoute = RouteProp<any, 'PlaylistDetail'>;

export default function PlaylistDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PlaylistDetailRoute>();
  const { name, color, icon, query: routeQuery, isLikedStack } = (route.params as any) || { name: 'Playlist', color: '#6200ea', icon: 'musical-notes' };
  const { width } = useWindowDimensions();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const { likedSongs, loading: likesLoading } = useLikes();
  const { user } = useAuth();

  // Use the playlist name or explicit query to search for songs
  const searchQuery = routeQuery || (name === 'Liked Songs' ? 'top hits' : name.replace(/\s+/g, '+'));
  const { data, isLoading: searchLoading } = useSearchMusic(isLikedStack ? '' : searchQuery);
  
  const songs: SongItem[] = isLikedStack ? likedSongs : (data?.pages.flatMap(p => p) || []);
  const isLoading = isLikedStack ? likesLoading : searchLoading;

  const handlePlayAll = async () => {
    if (songs.length === 0) return;
    await handlePlay(songs[0], 0);
  };

  const handlePlay = async (song: SongItem, index: number) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to listen to full tracks and save your progress.');
      navigation.navigate('Login' as never);
      return;
    }
    if (!song.streamUrl) return;
    try {
      setPlayingId(song.id);
      await TrackPlayer.reset();
      const queue = songs.filter(s => s.streamUrl).map(s => ({
        id: s.id, url: s.streamUrl!, title: s.title, artist: s.artist, artwork: s.artworkUrl,
      }));
      await TrackPlayer.add(queue);
      const qi = queue.findIndex(q => q.id === song.id);
      await TrackPlayer.skip(Math.max(0, qi));
      await TrackPlayer.play();
      setPlayingId(null);
      navigation.navigate('Player' as never);
    } catch {
      setPlayingId(null);
    }
  };

  const handleOpenPicker = (song: SongItem) => {
    setSelectedSong(song);
    setPickerVisible(true);
  };

  const isTablet = width >= 600;
  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
  const cardWidth = numColumns > 1 ? (width - 32 - (numColumns - 1) * 12) / numColumns : width - 24;

  return (
    <GlassContainer style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{name}</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={songs}
          key={`${numColumns}`} // Re-render when layout changes
          numColumns={numColumns}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          ListHeaderComponent={
            <View style={[styles.heroBanner, { backgroundColor: color + '55' }]}>
              <View style={[styles.heroIcon, { backgroundColor: color + '33', borderColor: color }]}>
                <Ionicons name={icon} size={60} color={color} />
              </View>
              <Text style={[styles.heroName, { color: theme.colors.text }]}>{name}</Text>
              <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
                {songs.length} songs
              </Text>
              <Pressable
                onPress={handlePlayAll}
                style={[styles.playAllBtn, { backgroundColor: color }]}>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.playAllText}>Play All</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => {
            if (numColumns > 1) {
              // Grid Card for Tablet/Desktop
              return (
                <Pressable
                  onPress={() => handlePlay(item, index)}
                  style={[styles.songCard, { width: cardWidth }]}>
                  {({ pressed }) => (
                    <GlassCard 
                      intensity={pressed ? 100 : 85} 
                      style={[
                        styles.cardInternal,
                        { 
                          backgroundColor: pressed ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.8)',
                          borderColor: pressed ? theme.colors.primary + 'AA' : 'rgba(255,255,255,0.08)'
                        }
                      ]}
                    >
                      <View style={styles.artWrapperLarge}>
                        <Image source={{ uri: item.artworkUrl }} style={styles.songArtLarge} />
                        {playingId === item.id && (
                          <View style={styles.loadingOverlay}>
                            <ActivityIndicator color="#fff" />
                          </View>
                        )}
                      </View>
                      <View style={styles.premiumCardInfo}>
                        <Text style={[styles.songTitleCard, { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.metaRowGrid}>
                          <Text style={[styles.songArtistCard, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{item.artist}</Text>
                          <Pressable onPress={() => handleOpenPicker(item)} style={styles.optionsBtn}>
                            <Ionicons name="ellipsis-vertical" size={16} color="rgba(255,255,255,0.6)" />
                          </Pressable>
                        </View>
                      </View>
                    </GlassCard>
                  )}
                </Pressable>
              );
            }

            // Row for Mobile
            return (
              <View style={styles.cardWrapper}>
                <Pressable onPress={() => handlePlay(item, index)}>
                  {({ pressed }) => (
                    <GlassCard 
                      intensity={pressed ? 100 : 85} 
                      style={[
                        styles.songRow, 
                        { 
                          backgroundColor: pressed ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.8)',
                          borderColor: pressed ? theme.colors.primary + 'AA' : 'rgba(255,255,255,0.08)'
                        }
                      ]}
                    >
                      <View style={styles.premiumRowContent}>
                        <View style={styles.artWrapperSmall}>
                          <Image source={{ uri: item.artworkUrl }} style={styles.songArtSmall} />
                          {playingId === item.id && (
                            <View style={styles.loadingOverlay}>
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.songInfoPremium}>
                          <Text style={[styles.songTitlePremium, { color: '#fff' }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.songArtistPremium, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                            {item.artist}
                          </Text>
                        </View>

                        <View style={styles.rowActions}>
                          <Pressable onPress={() => handleOpenPicker(item)} style={styles.optionsBtn} hitSlop={8}>
                            <Ionicons name="ellipsis-vertical" size={18} color="rgba(255,255,255,0.5)" />
                          </Pressable>
                          {playingId !== item.id && (
                            <Ionicons name="play" size={20} color={color} />
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  )}
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="musical-notes-outline" size={52} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>No songs found</Text>
            </View>
          }
        />
      )}

      <PlaylistPickerModal 
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        song={selectedSong}
      />
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardBottomRight: {
    alignSelf: 'flex-end',
  },
  heroBanner: {
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  playAllText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  songRow: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  premiumRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  artWrapperSmall: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.5)',
  },
  songArtSmall: {
    width: '100%',
    height: '100%',
  },
  songInfoPremium: {
    flex: 1,
    gap: 4,
  },
  songTitlePremium: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  songArtistPremium: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // New Card Grid Styles
  songCard: {
    padding: 6,
    marginBottom: 12,
  },
  cardInternal: {
    padding: 14,
    borderRadius: 24,
    alignItems: 'center',
    height: 280, 
    borderWidth: 1,
  },
  artWrapperLarge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    elevation: 10,
    boxShadow: '0px 6px 16px rgba(0,0,0,0.6)',
  },
  songArtLarge: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardInfo: {
    marginTop: 14,
    width: '100%',
    gap: 6,
  },
  songTitleCard: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  metaRowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  songArtistCard: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  optionsBtn: {
    padding: 4,
  },
  optionsBtnMobile: {
    padding: 10,
  },
});
