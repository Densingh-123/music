import React from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, 
  ScrollView, Alert, Platform, Share
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useLikes } from '../hooks/useLikes';
import DownloadService from '../services/DownloadService';
import ShareService from '../services/ShareService';
import { SongItem } from '../services/api';

interface SongOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  song: any;
  onAddToPlaylist: () => void;
}

export default function SongOptionsMenu({ visible, onClose, song, onAddToPlaylist }: SongOptionsMenuProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { toggleLike, isLiked } = useLikes();

  if (!song) return null;

  const handleAction = (action: string) => {
    onClose();
    switch (action) {
      case 'like':
        toggleLike(song);
        break;
      case 'download': {
        const songItem: SongItem = {
          id: song.id,
          title: song.title,
          artist: song.artist,
          artworkUrl: song.artworkUrl || '',
          streamUrl: song.streamUrl,
        };
        DownloadService.downloadSong(songItem).then(res => {
          if (res) Alert.alert('Success', 'Song downloaded!');
          else Alert.alert('Error', 'Download failed.');
        });
        break;
      }
      case 'queue':
        Alert.alert('Queue', 'Currently playing queue view coming soon!');
        break;
      case 'share': {
        const songItem: SongItem = {
          id: song.id,
          title: song.title,
          artist: song.artist,
          artworkUrl: song.artworkUrl || '',
          streamUrl: song.streamUrl,
        };
        ShareService.shareSong(songItem);
        break;
      }
      case 'artist':
        (navigation as any).navigate('ArtistDetail', { artist: song.artist });
        break;
      default:
        break;
    }
  };

  const options = [
    { id: 'like', label: isLiked(song.id) ? 'Remove from Liked' : 'Add to Liked Songs', icon: isLiked(song.id) ? 'heart' : 'heart-outline', color: isLiked(song.id) ? '#e91e63' : undefined },
    { id: 'playlist', label: 'Add to Playlist', icon: 'list', action: onAddToPlaylist },
    { id: 'download', label: 'Download Song', icon: 'download-outline' },
    { id: 'queue', label: 'View Queue', icon: 'musical-notes-outline' },
    { id: 'share', label: 'Share', icon: 'share-social-outline' },
    { id: 'artist', label: 'Go to Artist', icon: 'person-outline' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.overlay}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GlassCard intensity={60} style={styles.content}>
              <View style={styles.songHeader}>
                <Text style={[styles.songTitle, { color: theme.colors.text }]} numberOfLines={1}>{song.title}</Text>
                <Text style={[styles.songArtist, { color: theme.colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: theme.colors.glassBorder }]} />

              <ScrollView>
                {options.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => opt.id === 'playlist' ? (onClose(), onAddToPlaylist()) : handleAction(opt.id)}
                    style={({ pressed }) => [
                      styles.optionItem,
                      pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }
                    ]}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons name={opt.icon as any} size={22} color={opt.color || theme.colors.text} />
                    </View>
                    <Text style={[styles.optionLabel, { color: opt.color || theme.colors.text }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </GlassCard>
          </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 30,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  songHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
