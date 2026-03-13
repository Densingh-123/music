import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { useTheme } from '@/src/theme/ThemeContext';

interface SongCardProps {
  item: {
    id: string;
    title: string;
    artist: string;
    artworkUrl: string;
  };
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
  width?: number;
  height?: number;
}

export default function SongCard({ item, onPress, onMorePress, isPlaying, width = 180, height = 240 }: SongCardProps) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <View style={[styles.wrapper, { width }]}>
      <Pressable
        onPress={onPress}
        onPointerEnter={() => Platform.OS === 'web' && setIsHovered(true)}
        onPointerLeave={() => Platform.OS === 'web' && setIsHovered(false)}
        style={({ pressed }) => [
          styles.pressable,
          { height, borderRadius: 24, overflow: 'hidden' },
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
        ]}
      >
        <Image
          source={{ uri: item.artworkUrl }}
          style={[StyleSheet.absoluteFill, styles.image]}
          resizeMode="cover"
        />
        
        {/* Hover / Playing Overlay */}
        {(isHovered || isPlaying) && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }]}>
            {isPlaying ? (
              <Ionicons name="pause" size={40} color="#fff" />
            ) : (
              <Ionicons name="play" size={40} color="#fff" />
            )}
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.info}>
            <Text style={[styles.title, { color: '#fff' }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.artist, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
        </LinearGradient>

        {onMorePress && (
          <Pressable 
            onPress={(e) => {
              e.stopPropagation();
              onMorePress();
            }}
            style={styles.moreBtn}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 6,
  },
  pressable: {
    position: 'relative',
    boxShadow: '0px 10px 20px rgba(0,0,0,0.3)',
    elevation: 10,
  },
  image: {
    borderRadius: 24,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  info: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
  },
  moreBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
