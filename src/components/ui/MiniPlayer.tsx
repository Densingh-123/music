import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/theme/ThemeContext';
import { RootStackParamList } from '@/src/navigation/RootNavigator';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';

export default function MiniPlayer() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <Pressable 
      onPress={() => navigation.navigate('Player')} 
      style={styles.container}
    >
      <BlurView intensity={80} tint="dark" style={[styles.blurView, { borderTopColor: theme.colors.glassBorder }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' }} 
          style={styles.albumArt}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: theme.colors.text }]} numberOfLines={1}>Melody Box Anthem</Text>
          <Text style={[styles.artistName, { color: theme.colors.textSecondary }]} numberOfLines={1}>React Native Artist</Text>
        </View>
        <Pressable onPress={togglePlayback} style={styles.playButton}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={theme.colors.text} />
        </Pressable>
        <Pressable onPress={async () => await TrackPlayer.skipToNext()} style={styles.skipButton}>
          <Ionicons name="play-skip-forward" size={26} color={theme.colors.text} />
        </Pressable>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Tab bar height
    left: 8,
    right: 8,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  albumArt: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  artistName: {
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
    marginLeft: 4,
  }
});
