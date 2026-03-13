import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Image, Pressable, useWindowDimensions, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import SkeletonLoader from '@/src/components/ui/SkeletonLoader';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrendingMusic } from '@/src/hooks/useMusicData';
import { useNavigation } from '@react-navigation/native';
import { SongItem } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { trackRecentlyPlayed } from '@/src/services/musicService';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import SongCard from '@/src/components/ui/SongCard';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import { useRecentlyPlayed } from '@/src/hooks/useRecentlyPlayed';
import { useAuth } from '@/src/theme/AuthContext';

const GENRES = [
  { label: 'Pop', color: '#FF6B6B', icon: 'musical-note' },
  { label: 'Chill', color: '#4ECDC4', icon: 'moon' },
  { label: 'Workout', color: '#45B7D1', icon: 'barbell' },
  { label: 'Rock', color: '#96CEB4', icon: 'musical-note' },
  { label: 'Party', color: '#FFEEAD', icon: 'disc' },
  { label: 'Melody', color: '#FFB7B2', icon: 'heart' },
  { label: 'Dance', color: '#E2F0CB', icon: 'body' },
  { label: 'Devotional', color: '#B5EAD7', icon: 'flower' },
  { label: 'Classical', color: '#C7CEEA', icon: 'musical-notes' },
  { label: 'Jazz', color: '#D4A5A5', icon: 'wine' },
  { label: 'Folk', color: '#9B59B6', icon: 'leaf' },
  { label: 'Hip-Hop', color: '#E67E22', icon: 'headset' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  
  const { data: trending, isLoading, refetch } = useTrendingMusic();
  const { recentlyPlayed } = useRecentlyPlayed(12);
  const { user } = useAuth();

  const isTablet = width >= 600;
  const isDesktop = width >= 900;

  const handleOpenPicker = () => {
    setOptionsVisible(false);
    setPickerVisible(true);
  };

  const handleOpenOptions = (track: SongItem) => {
    setSelectedSong(track);
    setOptionsVisible(true);
  };

  const handlePlay = async (track: SongItem, index: number, list: SongItem[]) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to listen to full tracks and save your progress.');
      (navigation as any).navigate('Login');
      return;
    }
    setPlayingId(track.id);
    const success = await MusicPlayerService.playTrack({
      track,
      queue: list,
      onLoading: (loading) => { if (!loading) setPlayingId(null); },
      onError: (msg) => {
        Alert.alert('Playback Error', msg);
        setPlayingId(null);
      },
    });
    if (success) {
      trackRecentlyPlayed({ ...track, streamUrl: track.streamUrl ?? '' });
      (navigation as any).navigate('Player');
    }
  };

  const handleGenrePress = (genre: string) => {
    const queryMap: Record<string, string> = {
      'Pop': 'pop hits 2024', 'Chill': 'lofi chill beats', 'Workout': 'workout motivation',
      'Rock': 'classic rock anthems', 'Party': 'party dance hits', 'Jazz': 'smooth jazz collection',
      'Melody': 'tamil melody songs', 'Dance': 'folk dance songs', 'Devotional': 'devotional tracks',
      'Classical': 'indian classical music', 'Folk': 'village folk music', 'Hip-Hop': 'hip hop beats 2024'
    };
    (navigation as any).navigate('PlaylistDetail', { name: genre, id: genre.toLowerCase(), query: queryMap[genre] || genre });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const featured = trending?.slice(0, 3) || [];
  const topCharts = trending?.slice(3, 11) || []; 
  const topPlaylists = trending?.slice(11, 20) || [];
  const topArtists = trending?.slice(20, 28) || [];
  const trendingNow = trending?.slice(28) || [];

  const heroWidth = isDesktop ? 600 : isTablet ? 500 : width - 60;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      {/* Header */}
      {!isDesktop && (
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.brandingRow}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary + '44' }]}>
              <Ionicons name="musical-notes" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>{getGreeting()} 👋</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>BloomeeTunes</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <Pressable 
              onPress={() => (navigation as any).navigate('Notifications')} 
              style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.07)' }]}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            </Pressable>
            <Pressable 
              onPress={() => (navigation as any).navigate('Settings')} 
              style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.07)' }]}
            >
              <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Featured Banner – Hero Cards */}
        {featured.length > 0 || isLoading ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Today</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
              snapToInterval={heroWidth + 14}
              decelerationRate="fast"
            >
              {isLoading ? (
                [0, 1].map(i => <SkeletonLoader key={i} width={heroWidth} height={200} style={{ marginRight: 12, borderRadius: 20 }} />)
              ) : featured.map((item, idx) => (
                <Pressable
                  key={item.id}
                  style={[styles.heroCard, { width: heroWidth }]}
                  onPress={() => handlePlay(item, idx, featured)}
                >
                  <Image source={{ uri: item.artworkUrl }} style={styles.heroArt} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.heroGradient}
                  >
                    <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.heroBadgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.heroTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.heroArtist} numberOfLines={1}>{item.artist}</Text>
                    <View style={styles.heroActions}>
                      <View style={[styles.playBtn, { backgroundColor: theme.colors.primary }]}>
                        {playingId === item.id
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Ionicons name="play" size={18} color="#fff" />
                        }
                      </View>
                      <Pressable onPress={() => handleOpenOptions(item)} style={styles.moreBtn}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
                      </Pressable>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Recently Played */}
        {(recentlyPlayed.length > 0 || !user) && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently Played</Text>
              <Pressable onPress={() => (navigation as any).navigate('RecentlyPlayed')} style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
              </Pressable>
            </View>
            {!user ? (
              <GlassCard intensity={20} style={styles.loginPrompt}>
                <Ionicons name="lock-closed-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={[styles.loginPromptText, { color: theme.colors.textSecondary }]}>
                  Login to see your recently played songs
                </Text>
                <Pressable 
                  style={[styles.loginPromptBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => (navigation as any).navigate('Login')}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
                </Pressable>
              </GlassCard>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {recentlyPlayed.map((item, idx) => (
                  <SongCard
                    key={`rp-${item.id}-${idx}`}
                    item={item}
                    onPress={() => handlePlay(item, idx, recentlyPlayed)}
                    onMorePress={() => handleOpenOptions(item)}
                    isPlaying={playingId === item.id}
                    width={isTablet ? 160 : 140}
                    height={isTablet ? 210 : 185}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Genres & Moods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Genres & Moods</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {GENRES.map((genre, i) => (
              <Pressable
                key={genre.label}
                onPress={() => handleGenrePress(genre.label)}
                style={[styles.genreCard, { backgroundColor: genre.color + 'DD' }]}
              >
                <Ionicons name={genre.icon as any} size={22} color="rgba(0,0,0,0.7)" />
                <Text style={styles.genreLabel}>{genre.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Top Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Charts</Text>
            <Pressable onPress={() => (navigation as any).navigate('Search')} style={styles.seeAllBtn}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={160} height={210} style={{ marginRight: 14, borderRadius: 16 }} />)
            ) : topCharts.map((item, idx) => (
              <SongCard
                key={item.id}
                item={item}
                onPress={() => handlePlay(item, idx, topCharts)}
                onMorePress={() => handleOpenOptions(item)}
                isPlaying={playingId === item.id}
                width={160}
                height={210}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Albums */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={160} height={210} style={{ marginRight: 14, borderRadius: 16 }} />)
            ) : topPlaylists.map((item, idx) => (
              <SongCard
                key={item.id}
                item={item}
                onPress={() => handlePlay(item, idx, topPlaylists)}
                onMorePress={() => handleOpenOptions(item)}
                isPlaying={playingId === item.id}
                width={160}
                height={210}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Artists */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={120} height={160} style={{ marginRight: 20, borderRadius: 60 }} />)
            ) : topArtists.map((item, idx) => (
              <Pressable
                key={item.id}
                style={styles.artistItem}
                onPress={() => handlePlay(item, idx, topArtists)}
              >
                <View style={styles.artistImgWrapper}>
                  <Image source={{ uri: item.artworkUrl }} style={styles.artistArt} />
                  {playingId === item.id && (
                    <View style={styles.artistPlayOverlay}>
                      <ActivityIndicator color="#fff" size="small" />
                    </View>
                  )}
                </View>
                <Text style={[styles.artistName, { color: theme.colors.text }]} numberOfLines={1}>{item.artist || item.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Trending Now */}
        {trendingNow.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trending Now 🔥</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trendingNow.map((item, idx) => (
                <SongCard
                  key={item.id}
                  item={item}
                  onPress={() => handlePlay(item, idx, trendingNow)}
                  onMorePress={() => handleOpenOptions(item)}
                  isPlaying={playingId === item.id}
                  width={isTablet ? 160 : 140}
                  height={isTablet ? 210 : 185}
                />
              ))}
            </ScrollView>
          </View>
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
      </ScrollView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hScroll: {
    paddingRight: 16,
    gap: 12,
  },
  // Hero / Featured
  heroCard: {
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
  },
  heroArt: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  heroArtist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtn: {
    padding: 4,
  },
  // Genre
  genreCard: {
    width: 110,
    height: 90,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  genreLabel: {
    fontWeight: '800',
    fontSize: 13,
    color: 'rgba(0,0,0,0.75)',
  },
  // Artists
  artistItem: {
    alignItems: 'center',
    width: 100,
  },
  artistImgWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  artistArt: {
    width: '100%',
    height: '100%',
  },
  artistPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  // Login prompt
  loginPrompt: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  loginPromptText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginPromptBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
});
