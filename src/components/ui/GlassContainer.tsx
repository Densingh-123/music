import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeContext';

interface GlassContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
}

export default function GlassContainer({ children, style, contentContainerStyle, scrollable = false }: GlassContainerProps) {
  const theme = useTheme();

  const content = scrollable ? (
    <ScrollView 
      style={styles.inner} 
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Background Gradient to emulate dark futuristic theme */}
      <LinearGradient
        colors={theme.colors.gradientColors as unknown as readonly [string, string, ...string[]]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={[styles.safeArea, style]}>
        {content}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // accommodate bottom tab
  }
});
