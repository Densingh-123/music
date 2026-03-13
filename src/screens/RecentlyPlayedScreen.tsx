import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Pressable, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '@/src/components/ui/GlassContainer';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import SongCard from '@/src/components/ui/SongCard';
import SongOptionsMenu from '@/src/components/SongOptionsMenu';
import PlaylistPickerModal from '@/src/components/PlaylistPickerModal';
import { SongItem } from '@/src/services/api';
import MusicPlayerService from '@/src/services/MusicPlayerService';
import { useRecentlyPlayed } from '@/src/hooks/useRecentlyPlayed';

export default function RecentlyPlayedScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { recentlyPlayed: songs, loading } = useRecentlyPlayed(50);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const isTablet = width >= 600;
  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const handlePlay = async (track: SongItem, index: number) => {
    setPlayingId(track.id);
    const success = await MusicPlayerService.playTrack({
      track,
      queue: songs,
      onLoading: (loading) => { if (!loading) setPlayingId(null); },
      onError: (msg) => {
        console.warn('Error playing track', msg);
        setPlayingId(null);
      },
    });
    if (success) navigation.navigate('Player' as never);
  };

  const handleOpenPicker = () => {
    setOptionsVisible(false);
    setPickerVisible(true);
  };

  const handleOpenOptions = (track: SongItem) => {
    setSelectedSong(track);
    setOptionsVisible(true);
  };

  const renderItem = ({ item, index }: { item: SongItem; index: number }) => {
    const cardWidth = (width - 40 - (numColumns - 1) * 12) / numColumns;
    return (
      <SongCard 
        item={item} 
        onPress={() => handlePlay(item, index)} 
        onMorePress={() => handleOpenOptions(item)}
        isPlaying={playingId === item.id}
        width={cardWidth}
        height={isDesktop ? 220 : 180}
      />
    );
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recently Played</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No songs played yet</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            Play a song and it will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          numColumns={numColumns}
          key={`rp-${numColumns}`}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
});
