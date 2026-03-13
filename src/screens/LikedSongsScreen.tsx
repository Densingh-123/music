import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, Pressable,
  ActivityIndicator, Alert, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SongItem } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { useLikes } from '@/src/hooks/useLikes';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';

export default function LikedSongsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const { likedSongs, loading } = useLikes();

  const handlePlay = async (song: SongItem, index: number) => {
    setPlayingId(song.id);
    const success = await MusicPlayerService.playTrack({
      track: song,
      queue: likedSongs,
      onLoading: (l) => { if (!l) setPlayingId(null); },
      onError: () => setPlayingId(null),
    });
    if (success) (navigation as any).navigate('Player');
  };

  const handlePlayAll = () => { if (likedSongs.length > 0) handlePlay(likedSongs[0], 0); };

  const handleOpenOptions = (song: SongItem) => {
    setSelectedSong(song);
    setOptionsVisible(true);
  };

  const ACCENT = '#e91e63';

  return (
    <GlassContainer style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={[styles.screenHeader, { paddingTop: insets.top + 8 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
                  <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => handleOpenOptions(likedSongs[0])} style={styles.backBtn} hitSlop={12}>
                  <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
                </Pressable>
              </View>

              {/* Hero Banner */}
              <LinearGradient
                colors={[ACCENT + '44', 'transparent']}
                style={styles.heroBanner}
              >
                <View style={[styles.heroIcon, { backgroundColor: ACCENT + '33', borderColor: ACCENT + '66' }]}>
                  <Ionicons name="heart" size={56} color={ACCENT} />
                </View>
                <Text style={[styles.heroName, { color: theme.colors.text }]}>Liked Songs</Text>
                <Text style={[styles.heroCount, { color: theme.colors.textSecondary }]}>
                  {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                </Text>

                {likedSongs.length > 0 && (
                  <View style={styles.heroActions}>
                    <Pressable
                      style={[styles.shuffleBtn, { borderColor: ACCENT }]}
                      onPress={handlePlayAll}
                    >
                      <Ionicons name="shuffle" size={18} color={ACCENT} />
                      <Text style={[styles.shuffleBtnText, { color: ACCENT }]}>Shuffle</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.playAllBtn, { backgroundColor: ACCENT }]}
                      onPress={handlePlayAll}
                    >
                      <Ionicons name="play" size={20} color="#fff" />
                      <Text style={styles.playAllText}>Play All</Text>
                    </Pressable>
                  </View>
                )}
              </LinearGradient>

              {likedSongs.length > 0 && (
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                  SONGS
                </Text>
              )}
            </>
          }
          renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
              <Pressable onPress={() => handlePlay(item, index)}>
                {({ pressed }) => (
                  <View style={styles.fullImageCard}>
                    <Image source={{ uri: item.artworkUrl }} style={styles.fullImage} />
                    <View style={[
                      styles.darkOverlay,
                      { backgroundColor: pressed ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.82)' }
                    ]}>
                      {playingId === item.id && (
                        <ActivityIndicator size="small" color="#fff" style={{ position: 'absolute', top: '40%', alignSelf: 'center' }} />
                      )}
                      <View style={[styles.hoverText, { opacity: pressed ? 1 : 0.3 }]}>
                        <Text style={styles.fullTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.fullArtist} numberOfLines={1}>{item.artist}</Text>
                      </View>
                      <View style={styles.cardActions}>
                        <View style={[styles.indexBadge, { backgroundColor: theme.colors.primary + '33' }]}>
                          <Text style={[styles.songIndex, { color: theme.colors.primary }]}>#{index + 1}</Text>
                        </View>
                        <View style={styles.actionRow}>
                          <Pressable onPress={() => handleOpenOptions(item)} hitSlop={8}>
                            <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
                          </Pressable>
                          {playingId !== item.id && (
                            <Ionicons name="play" size={20} color={theme.colors.primary} />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No liked songs yet</Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                Tap the heart icon on any song to add it here
              </Text>
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
        onAddToPlaylist={() => { setOptionsVisible(false); setPickerVisible(true); }}
      />
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBanner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 24,
  },
  heroIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroCount: {
    fontSize: 14,
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    gap: 6,
  },
  shuffleBtnText: {
    fontWeight: '700',
    fontSize: 14,
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
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  fullImageCard: {
    height: 140,
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
  hoverText: {
    gap: 3,
    marginBottom: 6,
  },
  fullTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.1,
  },
  fullArtist: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  songIndex: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  optionsBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
