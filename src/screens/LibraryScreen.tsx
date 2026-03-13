import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  useWindowDimensions, TouchableOpacity, Modal, TextInput, Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useLikes } from '@/src/hooks/useLikes';
import { usePlaylists } from '@/src/hooks/usePlaylists';
import { BlurView } from 'expo-blur';

const TABS = ['Playlists', 'Albums', 'Artists'] as const;
type Tab = typeof TABS[number];

const MOCK_DATA = {
  Albums: [
    { id: 'a1', name: 'Dawn FM', count: 16, icon: 'disc' as const, color: '#1565c0', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80' },
    { id: 'a2', name: 'Midnights', count: 13, icon: 'moon' as const, color: '#311b92', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&q=80' },
    { id: 'a3', name: 'Renaissance', count: 16, icon: 'sparkles' as const, color: '#b71c1c', image: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=400&q=80' },
    { id: 'a4', name: 'Utopia', count: 19, icon: 'planet' as const, color: '#37474f', image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&q=80' },
  ],
  Artists: [
    { id: 'r1', name: 'The Weeknd', count: 82, icon: 'person' as const, color: '#4a148c', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80' },
    { id: 'r2', name: 'Taylor Swift', count: 120, icon: 'person-circle' as const, color: '#880e4f', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80' },
    { id: 'r3', name: 'Drake', count: 95, icon: 'person' as const, color: '#1b5e20', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80' },
    { id: 'r4', name: 'Beyoncé', count: 78, icon: 'person-circle' as const, color: '#e65100', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80' },
  ],
};

export default function LibraryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<any>>();
  const { likedSongs } = useLikes();
  const { playlists, createPlaylist } = usePlaylists();
  const [activeTab, setActiveTab] = useState<Tab>('Playlists');
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      try {
        await createPlaylist(newPlaylistName.trim());
        setModalVisible(false);
        setNewPlaylistName('');
      } catch (e) {
        Alert.alert('Error', 'Failed to create playlist');
      }
    }
  };

  const isDesktop = width >= 900;
  const isTablet = width >= 600;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  let data: any[] = [];
  if (activeTab === 'Playlists') {
    data = [
      { id: 'liked', name: 'Liked Songs', count: likedSongs.length, icon: 'heart' as any, color: '#e91e63', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80' },
      ...playlists.map(p => ({
        id: p.id,
        name: p.name,
        count: p.songs?.length || 0,
        icon: p.icon as any,
        color: p.color,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'
      }))
    ];
  } else {
    data = (MOCK_DATA as any)[activeTab];
  }

  const handleItemPress = (item: any) => {
    (navigation as any).navigate('PlaylistDetail', {
      name: item.name,
      id: item.id,
      color: item.color,
      icon: item.icon,
      type: activeTab,
      isLikedStack: item.name === 'Liked Songs'
    });
  };

  const renderItem = ({ item }: { item: typeof data[0] }) => (
    <View style={[styles.itemWrapper, { width: `${100 / numColumns}%` as any }]}>
      <Pressable onPress={() => handleItemPress(item)}>
        {({ pressed }) => (
          <View style={styles.fullCard}>
            <Image source={{ uri: item.image }} style={styles.fullCardImage} />
            {/* Gradient overlay: light-dark at top, very dark at bottom */}
            <LinearGradient
              colors={
                pressed 
                  ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']
                  : ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']
              }
              locations={[0, 0.5, 1]}
              style={styles.gradientOverlay}
            >
              {/* Flash highlight on press */}
              {pressed && (
                <View style={styles.flashOverlay} />
              )}
              <View style={[styles.cardTextArea, { opacity: pressed ? 1 : 0.4 }]}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCount}>{item.count} tracks</Text>
              </View>
              <View style={[styles.cardBadge, { backgroundColor: item.color + '55' }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>
            </LinearGradient>
          </View>
        )}
      </Pressable>
    </View>
  );

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + (isDesktop ? 80 : 16) }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Library</Text>
        <Pressable onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabPill,
              { backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.surface }
            ]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : theme.colors.textSecondary }]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        key={`${activeTab}-${numColumns}`}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="library-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16, fontSize: 16 }}>No {activeTab.toLowerCase()} found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard intensity={60} style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Playlist</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.glassBorder }]}
              placeholder="Playlist name..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreatePlaylist} style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>
              </Pressable>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  addBtn: {
    padding: 4,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 10,
  },
  itemWrapper: {
    padding: 8,
  },
  fullCard: {
    height: 240,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  fullCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardTextArea: {
    gap: 3,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
  },
  cardCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  cardBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
});
