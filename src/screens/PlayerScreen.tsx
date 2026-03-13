import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  useWindowDimensions, PanResponder, Alert,
  Modal, ScrollView, TouchableOpacity, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '@/src/components/ui/GlassContainer';
import { useTheme } from '@/src/theme/ThemeContext';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, {
  usePlaybackState, State, useProgress, useActiveTrack, RepeatMode
} from 'react-native-track-player';
import { useLikes } from '@/src/hooks/useLikes';
import { SongItem, getLyrics, LyricLine } from '@/src/services/api';
import DownloadService from '@/src/services/DownloadService';
import ShareService from '@/src/services/ShareService';
import MusicPlayerService from '@/src/services/MusicPlayerService';

export default function PlayerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const playbackState = usePlaybackState();
  const progress = useProgress();
  const activeTrack = useActiveTrack();
  const { toggleLike, isLiked } = useLikes();

  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [showMenu, setShowMenu] = useState(false);
  const progressBarRef = useRef<View>(null);
  const [progressBarLayout, setProgressBarLayout] = useState({ x: 0, width: 0 });
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const isPlaying = playbackState.state === State.Playing;

  // Responsive sizing
  const isDesktop = width >= 900;
  const isTablet = width >= 600;
  const albumSize = isDesktop ? Math.min(380, height * 0.4) : isTablet ? Math.min(320, height * 0.4) : Math.min(width - 80, 300);

  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 12000, easing: Easing.linear }),
        -1
      );
    }
  }, [isPlaying]);

  const animatedAlbumStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const togglePlayback = async () => {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  const skipNext = async () => {
    try { await TrackPlayer.skipToNext(); } catch { /* end of queue */ }
  };
  const skipPrev = async () => {
    try { await TrackPlayer.skipToPrevious(); } catch { /* start of queue */ }
  };

  const toggleRepeat = async () => {
    const next = repeatMode === RepeatMode.Off
      ? RepeatMode.Track
      : repeatMode === RepeatMode.Track
        ? RepeatMode.Queue : RepeatMode.Off;
    await TrackPlayer.setRepeatMode(next);
    setRepeatMode(next);
  };

  const handleLike = () => {
    if (!activeTrack) return;
    const song: SongItem = {
      id: activeTrack.id,
      title: activeTrack.title || 'Unknown',
      artist: activeTrack.artist || 'Unknown',
      artworkUrl: activeTrack.artwork || '',
      streamUrl: activeTrack.url || '',
    };
    toggleLike(song);
  };

  const currentlyLiked = activeTrack ? isLiked(activeTrack.id) : false;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = progress.duration > 0
    ? Math.min(1, Math.max(0, progress.position / progress.duration))
    : 0;

  const handleSeekGesture = (pageX: number) => {
    if (progressBarLayout.width > 0 && progress.duration > 0) {
      const relativeX = pageX - progressBarLayout.x;
      const percentage = Math.min(1, Math.max(0, relativeX / progressBarLayout.width));
      setSeekProgress(percentage);
      if (!isSeeking) setIsSeeking(true);
    }
  };

  const handleSeekEnd = () => {
    if (isSeeking && progress.duration > 0) {
      TrackPlayer.seekTo(progress.duration * seekProgress);
      setIsSeeking(false);
    }
  };

  // Pan responder for seeking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleSeekGesture(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        handleSeekGesture(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: handleSeekEnd,
      onPanResponderTerminate: handleSeekEnd,
    })
  ).current;

  React.useEffect(() => {
    const fetchRealLyrics = async () => {
      if (activeTrack?.id) {
        const data = await getLyrics(
          activeTrack.id,
          activeTrack.title,
          activeTrack.artist,
          (activeTrack as any).album, 
          progress.duration
        );
        setLyrics(data.synced);
      }
    };
    fetchRealLyrics();
  }, [activeTrack?.id, progress.duration]);

  // Hook to automatically resolve dummy streams when the active track changes
  // This mirrors Flutter's QueueManager.onPrepareToPlay callback
  React.useEffect(() => {
    if (activeTrack) {
      // Delegate to MusicPlayerService which handles all dummy URL patterns
      MusicPlayerService.resolveAndResumeTrack(activeTrack as any);
    }
  }, [activeTrack?.id]);

  const currentPercent = isSeeking ? seekProgress : progressPercent;

  const handleDownload = async () => {
    if (!activeTrack) return;
    const song: SongItem = {
      id: activeTrack.id,
      title: activeTrack.title || 'Unknown',
      artist: activeTrack.artist || 'Unknown',
      artworkUrl: activeTrack.artwork || '',
      streamUrl: activeTrack.url || '',
    };
    
    setDownloadProgress(0);
    const result = await DownloadService.downloadSong(song, (p) => {
      setDownloadProgress(p);
    });
    
    if (result) {
      Alert.alert('Success', 'Song downloaded successfully!');
    } else {
      Alert.alert('Error', 'Failed to download song.');
    }
    setDownloadProgress(null);
  };

  const handleShare = async () => {
    if (!activeTrack) return;
    const song: SongItem = {
      id: activeTrack.id,
      title: activeTrack.title || 'Unknown',
      artist: activeTrack.artist || 'Unknown',
      artworkUrl: activeTrack.artwork || '',
      streamUrl: activeTrack.url || '',
    };
    await ShareService.shareSong(song);
  };

  const menuOptions = [
    { icon: 'heart', label: 'Add to Liked Songs', action: handleLike },
    { icon: 'download-outline', label: 'Download Song', action: handleDownload },
    { icon: 'list', label: 'View Queue', action: () => Alert.alert('Queue', 'Queue view coming soon!') },
    { icon: 'share-social', label: 'Share', action: handleShare },
    { icon: 'musical-notes', label: 'Go to Artist', action: () => Alert.alert('Artist', 'Artist page coming soon!') },
    { icon: 'add-circle', label: 'Add to Playlist', action: () => Alert.alert('Playlist', 'Playlist feature coming soon!') },
  ];

  const currentLyricIdx = lyrics.findIndex((l, i) => {
    const nextTime = lyrics[i+1]?.time || 9999;
    return progress.position >= l.time && progress.position < nextTime;
  });

  const lyricsScrollRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (currentLyricIdx !== -1) {
      lyricsScrollRef.current?.scrollTo({
        y: Math.max(0, currentLyricIdx * 45 - (isDesktop ? 150 : 100)),
        animated: true
      });
    }
  }, [currentLyricIdx]);

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[
        styles.container,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        isDesktop && { flexDirection: 'row', maxWidth: 1100, alignSelf: 'center', width: '100%' }
      ]}>


        {/* Header */}
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-down" size={30} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Now Playing</Text>
          <Pressable onPress={() => setShowMenu(true)} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={26} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Album Art Column (desktop: left side) */}
        <View style={[
          styles.albumSection,
          isDesktop && { flex: 1, marginRight: 40 }
        ]}>
          <Animated.View style={[
            styles.albumWrapper,
            { 
              width: albumSize, height: albumSize, borderRadius: albumSize / 2, borderColor: theme.colors.border,
              ...(Platform.OS === 'web' 
                ? { boxShadow: `0px 12px 32px ${theme.colors.primary}88` } as any
                : { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 28, elevation: 24 }
              )
            },
            animatedAlbumStyle
          ]}>
            <Image
              source={{ uri: activeTrack?.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop' }}
              style={styles.albumArt}
            />
          </Animated.View>
        </View>

        {/* Controls Column (desktop: right side) */}
        <View style={[styles.controlSection, isDesktop && { flex: 1 }]}>
          {/* Song Info + Like */}
          <View style={styles.songInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.songTitle, { color: theme.colors.text }]} numberOfLines={2}>
                {activeTrack?.title || 'Unknown Title'}
              </Text>
              <Text style={[styles.artistName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {activeTrack?.artist || 'Unknown Artist'}
              </Text>
            </View>
            <Pressable onPress={handleLike} style={styles.iconBtn} hitSlop={10}>
              <Ionicons name={currentlyLiked ? 'heart' : 'heart-outline'} size={28} color={currentlyLiked ? '#e91e63' : theme.colors.textSecondary} />
            </Pressable>
          </View>

          {downloadProgress !== null && (
            <View style={{ height: 4, backgroundColor: theme.colors.surface, borderRadius: 2, marginBottom: 12 }}>
              <View style={{ height: '100%', width: `${downloadProgress * 100}%`, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
              <Text style={{ fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                Downloading... {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View
              ref={progressBarRef}
              style={styles.progressContainer}
              onLayout={(e) => {
                // Better measurement: use getBoundingClientRect on web or measure on mobile
                if (Platform.OS === 'web') {
                  const node = progressBarRef.current as any;
                  if (node && node.getBoundingClientRect) {
                    const rect = node.getBoundingClientRect();
                    setProgressBarLayout({ x: rect.left, width: rect.width });
                  }
                } else {
                  progressBarRef.current?.measure((x, y, w, h, pageX, pageY) => {
                    setProgressBarLayout({ x: pageX, width: w });
                  });
                }
              }}
              {...panResponder.panHandlers}
            >
              <View style={[styles.progressBg, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.progressFill, { width: `${currentPercent * 100}%`, backgroundColor: theme.colors.primary }]} />
                {/* Seek handle - bigger when seeking */}
                <View style={[
                  styles.seekHandle,
                  { 
                    left: `${currentPercent * 100}%`, 
                    backgroundColor: theme.colors.primary,
                    transform: [{ scale: isSeeking ? 1.5 : 1 }]
                  }
                ]} />
              </View>
            </View>
            <View style={styles.timeRow}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {formatTime(isSeeking ? seekProgress * progress.duration : progress.position)}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{formatTime(progress.duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable onPress={() => Alert.alert('Shuffle', 'Shuffle coming soon!')} hitSlop={12}>
              <Ionicons name="shuffle-outline" size={26} color={theme.colors.textSecondary} />
            </Pressable>

            <Pressable onPress={skipPrev} hitSlop={12}>
              <Ionicons name="play-skip-back" size={42} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={togglePlayback} style={[
              styles.playBtn, 
              { 
                backgroundColor: theme.colors.primary,
                ...(Platform.OS === 'web'
                  ? { boxShadow: `0px 6px 16px ${theme.colors.primary}77` } as any
                  : { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 12 }
                )
              }
            ]}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={44}
                color="#fff"
                style={{ marginLeft: isPlaying ? 0 : 4 }}
              />
            </Pressable>

            <Pressable onPress={skipNext} hitSlop={12}>
              <Ionicons name="play-skip-forward" size={42} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={toggleRepeat} hitSlop={12}>
              <Ionicons
                name={repeatMode === RepeatMode.Track ? 'repeat-outline' : 'repeat-outline'}
                size={26}
                color={repeatMode !== RepeatMode.Off ? theme.colors.primary : theme.colors.textSecondary}
              />
              {repeatMode === RepeatMode.Track && (
                <View style={[styles.repeatDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </Pressable>
          </View>

          {/* Lyrics Section */}
          <View style={[styles.lyricsContainer, isDesktop && { height: 300 }]}>
            <Text style={[styles.lyricsTitle, { color: theme.colors.textSecondary }]}>Lyrics</Text>
            {lyrics.length > 0 ? (
              <ScrollView
                ref={lyricsScrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.lyricsScroll}
                scrollEnabled={false} // Auto-scroll only
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === currentLyricIdx;
                  return (
                    <View 
                      key={`${line.time}-${idx}`} 
                      style={[styles.lyricLine, isActive && styles.activeLyricLine]}
                    >
                      <Text style={[
                        styles.lyricsText,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                        isActive && {
                          fontWeight: '800',
                          fontSize: 20,
                          textShadowColor: theme.colors.primary,
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 15,
                        }
                      ]}>
                        {line.text}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.noLyrics}>
                <Ionicons name="musical-notes-outline" size={32} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
                <Text style={{ color: theme.colors.textSecondary, marginTop: 8, opacity: 0.5 }}>No synchronized lyrics</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Three-dot menu modal */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuSheet, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.menuHandle} />
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
              {activeTrack?.title || 'Options'}
            </Text>
            <Text style={[{ color: theme.colors.textSecondary, marginBottom: 16, paddingHorizontal: 20 }]}>
              {activeTrack?.artist}
            </Text>
            {menuOptions.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.menuOption}
                onPress={() => { setShowMenu(false); opt.action(); }}>
                <Ionicons name={opt.icon as any} size={22} color={theme.colors.primary} />
                <Text style={[styles.menuOptionText, { color: theme.colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerDesktop: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 8,
  },
  albumSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  albumWrapper: {
    borderWidth: 3,
    overflow: 'hidden',
    // Shadow is now applied inline to use dynamic theme.colors.primary
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  controlSection: {
    justifyContent: 'center',
  },
  songInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  artistName: {
    fontSize: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    paddingVertical: 12, // Large hit area for seeking
    marginBottom: 4,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  seekHandle: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.4)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
      }
    }),
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 16,
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow is now applied inline to use dynamic theme.colors.primary
  },
  repeatDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menuSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#888',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Lyrics Styles
  lyricsContainer: {
    marginTop: 24,
    padding: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lyricsScroll: {
    paddingBottom: 10,
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 28,
  },
  lyricLine: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  activeLyricLine: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  noLyrics: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
