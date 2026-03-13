import React from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  useWindowDimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';

export default function MiniPlayer() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  React.useEffect(() => {
    if (activeTrack) setIsDismissed(false);
  }, [activeTrack?.id]);

  // Fake progress bar animation based on time
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => (p >= 1 ? 0 : p + 0.002));
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!activeTrack || isDismissed) return null;

  const handleClose = async () => {
    await TrackPlayer.reset();
    setIsDismissed(true);
  };

  const handlePress = () => (navigation as any).navigate('Player');

  const togglePlay = async (e: any) => {
    e.stopPropagation?.();
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  const skipNext = async (e: any) => {
    e.stopPropagation?.();
    await TrackPlayer.skipToNext().catch(() => {});
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Blur background */}
      <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFillObject} />
      {/* Subtle gradient overlay */}
      <LinearGradient
        colors={[theme.colors.primary + '18', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Top border */}
      <View style={[styles.topBorder, { backgroundColor: theme.colors.primary + '60' }]} />

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.primary }]} />
      </View>

      <View style={styles.inner}>
        {/* Artwork */}
        <Image
          source={{ uri: activeTrack.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300' }}
          style={styles.artwork}
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {activeTrack.title}
          </Text>
          <Text style={[styles.artist, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {activeTrack.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={togglePlay} hitSlop={10} style={[styles.playBtn, { backgroundColor: theme.colors.primary }]}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color="#fff"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </Pressable>
          <Pressable onPress={skipNext} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="play-skip-forward" size={22} color={theme.colors.text} />
          </Pressable>
          <Pressable onPress={handleClose} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px -4px 20px rgba(0,0,0,0.4)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 24,
      }
    }),
  },
  topBorder: {
    height: 1,
  },
  progressTrack: {
    height: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  artist: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
