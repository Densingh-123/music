import React from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, 
  FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { usePlaylists } from '../hooks/usePlaylists';

interface PlaylistPickerModalProps {
  visible: boolean;
  onClose: () => void;
  song: any;
}

export default function PlaylistPickerModal({ visible, onClose, song }: PlaylistPickerModalProps) {
  const theme = useTheme();
  const { playlists, addSongToPlaylist } = usePlaylists();

  const handleSelect = async (playlistId: string, playlistName: string) => {
    try {
      await addSongToPlaylist(playlistId, song);
      Alert.alert('Success', `Added to ${playlistName}`);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to add to playlist');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.overlay}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GlassCard intensity={60} style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Add to Playlist</Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </Pressable>
              </View>

              {playlists.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={{ color: theme.colors.textSecondary }}>No playlists found. Create one in the Library!</Text>
                </View>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <Pressable 
                      onPress={() => handleSelect(item.id, item.name)}
                      style={({pressed}) => [styles.item, pressed && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    >
                      <View style={[styles.iconBox, { backgroundColor: item.color + '33' }]}>
                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                      </View>
                      <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                    </Pressable>
                  )}
                />
              )}
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
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
