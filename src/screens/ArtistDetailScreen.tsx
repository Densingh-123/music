import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  Pressable, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import GlassContainer from '@/src/components/ui/GlassContainer';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SongCard from '@/src/components/ui/SongCard';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import { searchMusic, SongItem } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';

export default function ArtistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { artist } = (route.params as any) || { artist: 'Unknown Artist' };

  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 4 : 2;

  useEffect(() => {
    const fetchArtistSongs = async () => {
      setLoading(true);
      try {
        const results = await searchMusic(artist);
        setSongs(results);
      } catch (error) {
        console.error("Error fetching artist songs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistSongs();
  }, [artist]);

  const handlePlay = async (item: SongItem, index: number) => {
    setPlayingId(item.id);
    const success = await MusicPlayerService.playTrack({
      track: item,
      queue: songs,
      onLoading: (loading) => { if (!loading) setPlayingId(null); },
      onError: (msg) => {
        console.warn("Play error:", msg);
        setPlayingId(null);
      },
    });
    if (success) navigation.navigate('Player' as never);
  };

  const renderItem = ({ item, index }: { item: SongItem; index: number }) => {
    const cardWidth = (width - 48 - (numColumns - 1) * 16) / numColumns;
    return (
      <SongCard
        item={item}
        onPress={() => handlePlay(item, index)}
        onMorePress={() => {
          setSelectedSong(item);
          setOptionsVisible(true);
        }}
        isPlaying={playingId === item.id}
        width={cardWidth}
        height={isDesktop ? 220 : 180}
      />
    );
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.artistName, { color: theme.colors.text }]}>{artist}</Text>
          <Text style={[styles.songCount, { color: theme.colors.textSecondary }]}>{songs.length} Track{songs.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SongOptionsMenu
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        song={selectedSong}
        onAddToPlaylist={() => {
          setOptionsVisible(false);
          setPickerVisible(true);
        }}
      />

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
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  backBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 14,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
