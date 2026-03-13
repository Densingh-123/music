import React, { useEffect } from 'react';
import {
  View, StyleSheet, useWindowDimensions, Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeContext';

interface BlobProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
}

const Blob = ({ size, color, initialX, initialY, duration }: BlobProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(Math.random() * 100 - 50, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(Math.random() * 100 - 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.2, { duration: duration * 0.8, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
          opacity: 0.4,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function BlobBackground() {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Primary Blob */}
      <Blob 
        size={width * 0.9} 
        color={theme.colors.primary} 
        initialX={-width * 0.3} 
        initialY={-height * 0.2} 
        duration={12000} 
      />
      {/* Accent Blob */}
      <Blob 
        size={width * 0.8} 
        color={theme.colors.accent || '#9c27b0'} 
        initialX={width * 0.5} 
        initialY={height * 0.4} 
        duration={15000} 
      />
      {/* Secondary Blob */}
      <Blob 
        size={width * 0.6} 
        color={theme.colors.primary} 
        initialX={width * 0.1} 
        initialY={height * 0.1} 
        duration={18000} 
      />
      {/* Glow Blob */}
      <Blob 
        size={width * 0.5} 
        color="#2196f3" 
        initialX={-width * 0.1} 
        initialY={height * 0.6} 
        duration={14000} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    ...Platform.select({
      web: {
        filter: 'blur(80px)',
      },
      native: {
        // Blur is limited on native without specialized libraries, 
        // but high opacity and large size emulate the effect
      }
    })
  },
});
