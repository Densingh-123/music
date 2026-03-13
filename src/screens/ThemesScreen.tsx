import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, 
  useWindowDimensions, FlatList, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '@/src/theme/ThemeContext';
import GlassContainer from '@/src/components/ui/GlassContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const DARK_MODES: ThemeMode[] = [
  'black', 'midnight', 'amoled', 'galaxy', 'ocean', 'forest', 'sunset', 'volcano', 'neon', 'cyberpunk',
  'deep_blue', 'deep_purple', 'deep_red', 'deep_teal', 'deep_orange', 'matrix', 'dracula', 'nord_dark', 'synthwave', 'obsidian',
  'charcoal', 'espresso', 'blood_moon', 'toxic', 'electric', 'royal_dark', 'emerald_dark', 'ruby', 'sapphire', 'twilight'
];

const LIGHT_MODES: ThemeMode[] = [
  'white', 'snow', 'sky', 'mint', 'rose', 'lemon', 'peach', 'lavender', 'sakura', 'nord_light'
];

const THEME_COLORS: Record<string, string> = {
  black:'#1a1a1a', midnight:'#0a192f', amoled:'#000000', galaxy:'#1e003c', ocean:'#001e3c', forest:'#0a1e0a', sunset:'#280f00', volcano:'#1a0000', neon:'#ccff00', cyberpunk:'#050a1a',
  deep_blue:'#000c1f', deep_purple:'#12003c', deep_red:'#200000', deep_teal:'#001a16', deep_orange:'#1a0d00', matrix:'#001100', dracula:'#282a36', nord_dark:'#2e3440', synthwave:'#1a0633', obsidian:'#1a1a1a',
  charcoal:'#1e1e1e', espresso:'#2d1b1a', blood_moon:'#200000', toxic:'#001a00', electric:'#001126', royal_dark:'#0a0029', emerald_dark:'#001a0f', ruby:'#1a0006', sapphire:'#00112b', twilight:'#1a041a',
  white:'#ffffff', snow:'#fafafa', sky:'#e1f5fe', mint:'#e0f2f1', rose:'#fce4ec', lemon:'#fffde7', peach:'#fff3e0', lavender:'#f3e5f5', sakura:'#fff0f5', nord_light:'#eceff4'
};

const CATEGORIES = [
  { title: 'Premium Dark (30)', modes: DARK_MODES },
  { title: 'Elegant Light (10)', modes: LIGHT_MODES },
];

export default function ThemesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width > 700 && width < 900;
  const numColumns = isDesktop ? 6 : isTablet ? 3 : 2;

  const renderThemeItem = (mode: ThemeMode) => {
    const isSelected = theme.currentMode === mode;
    const isWhite = mode === 'white' || mode === 'snow' || mode === 'nord_light';
    
    return (
      <Pressable
        key={mode}
        onPress={() => theme.setThemeMode(mode)}
        style={[
          styles.themeCard,
          { 
            width: (width - (isDesktop ? 120 : isTablet ? 60 : 44)) / numColumns,
            borderColor: isSelected ? theme.colors.primary : theme.colors.glassBorder,
            borderWidth: isSelected ? 3 : 1,
            backgroundColor: theme.colors.surface,
            transform: [{ scale: isSelected ? 1.05 : 1 }]
          }
        ]}
      >
        <View style={[styles.colorPreview, { backgroundColor: THEME_COLORS[mode] }]}>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={isWhite ? '#000' : '#fff'} />
          )}
          <View style={[styles.accentDot, { backgroundColor: isWhite ? '#0070ff' : '#ccff00' }]} />
        </View>
        <Text style={[styles.themeLabel, { color: theme.colors.text, fontSize: isDesktop ? 11 : 13 }]} numberOfLines={1}>
          {mode.replace('_', ' ').charAt(0).toUpperCase() + mode.replace('_', ' ').slice(1)}
        </Text>
      </Pressable>
    );
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Personalize</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose your vibe: 30 Dark, 10 Light</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.title} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: theme.colors.primary }]}>{cat.title}</Text>
            <View style={styles.grid}>
              {cat.modes.map(renderThemeItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 10,
  },
  categorySection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPreview: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 14,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.3)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }
    }),
  },
  accentDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
