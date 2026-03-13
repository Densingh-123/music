import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeContext';

interface GlassButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GlassButton({ onPress, title, style, textStyle, icon }: GlassButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
        opacity.value = withTiming(0.8, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 150 });
      }}
      style={[
        styles.buttonContainer,
        { 
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.xl,
        },
        style,
        animatedStyle,
      ]}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={styles.content}>
        {icon}
        <Text style={[styles.text, { color: theme.colors.text }, textStyle, icon ? { marginLeft: theme.spacing.sm } : {}]}>
          {title}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
import { View } from 'react-native';

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(30, 136, 229, 0.2)', // Slight blue tint for neon effect
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(30,136,229,0.3)' },
      default: {
        shadowColor: '#1e88e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
