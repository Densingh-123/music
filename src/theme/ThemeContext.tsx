import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

export type ThemeMode = 
  // 30 Dark Themes
  | 'black' | 'midnight' | 'amoled' | 'galaxy' | 'ocean' | 'forest' | 'sunset' | 'volcano' | 'neon' | 'cyberpunk'
  | 'deep_blue' | 'deep_purple' | 'deep_red' | 'deep_teal' | 'deep_orange' | 'matrix' | 'dracula' | 'nord_dark' | 'synthwave' | 'obsidian'
  | 'charcoal' | 'espresso' | 'blood_moon' | 'toxic' | 'electric' | 'royal_dark' | 'emerald_dark' | 'ruby' | 'sapphire' | 'twilight'
  // 10 Light Themes
  | 'white' | 'snow' | 'sky' | 'mint' | 'rose' | 'lemon' | 'peach' | 'lavender' | 'sakura' | 'nord_light';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
  glassBorder: string;
  isDark: boolean;
  gradientColors: string[];
}

export interface Theme {
  colors: ThemeColors;
  spacing: any;
  borderRadius: any;
}

const baseSpacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

const baseBorderRadius = {
  sm: 8, md: 16, lg: 20, xl: 30, round: 9999,
};

const themes: Record<ThemeMode, ThemeColors> = {
  // --- 30 DARK THEMES ---
  black: { primary: '#1e88e5', background: '#0a0a0a', surface: 'rgba(21,21,21,0.8)', surfaceHighlight: 'rgba(255,255,255,0.1)', text: '#ffffff', textSecondary: '#a0a0a0', accent: '#4fc3f7', border: 'rgba(255,255,255,0.1)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000000', '#1a1a1a', '#000000'] },
  midnight: { primary: '#64ffda', background: '#0a192f', surface: 'rgba(17,34,64,0.7)', surfaceHighlight: 'rgba(100,255,218,0.1)', text: '#ccd6f6', textSecondary: '#8892b0', accent: '#64ffda', border: 'rgba(100,255,218,0.2)', glassBorder: 'rgba(100,255,218,0.1)', isDark: true, gradientColors: ['#020c1b', '#0a192f', '#112240'] },
  amoled: { primary: '#ffffff', background: '#000000', surface: 'rgba(15,15,15,0.9)', surfaceHighlight: 'rgba(255,255,255,0.05)', text: '#ffffff', textSecondary: '#777777', accent: '#ffffff', border: '#222222', glassBorder: '#111111', isDark: true, gradientColors: ['#000000', '#000000', '#000000'] },
  galaxy: { primary: '#7c4dff', background: '#0b001e', surface: 'rgba(30,0,60,0.6)', surfaceHighlight: 'rgba(124,77,255,0.15)', text: '#ede7f6', textSecondary: '#b39ddb', accent: '#b388ff', border: 'rgba(124,77,255,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0b001e', '#1e003c', '#311b92'] },
  ocean: { primary: '#00b0ff', background: '#000b1a', surface: 'rgba(0,30,60,0.6)', surfaceHighlight: 'rgba(0,176,255,0.15)', text: '#e1f5fe', textSecondary: '#4fc3f7', accent: '#81d4fa', border: 'rgba(0,176,255,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000b1a', '#001e3c', '#01579b'] },
  forest: { primary: '#00e676', background: '#040d04', surface: 'rgba(10,30,10,0.7)', surfaceHighlight: 'rgba(0,230,118,0.15)', text: '#e8f5e9', textSecondary: '#81c784', accent: '#69f0ae', border: 'rgba(0,230,118,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#040d04', '#0a1e0a', '#1b5e20'] },
  sunset: { primary: '#ff5722', background: '#0d0500', surface: 'rgba(40,15,0,0.7)', surfaceHighlight: 'rgba(255,87,34,0.15)', text: '#fff3e0', textSecondary: '#ffab91', accent: '#ff8a65', border: 'rgba(255,87,34,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0d0500', '#280f00', '#4e342e'] },
  volcano: { primary: '#f44336', background: '#0a0000', surface: 'rgba(42,0,0,0.8)', surfaceHighlight: 'rgba(244,67,54,0.15)', text: '#ffebee', textSecondary: '#ef9a9a', accent: '#ff5252', border: '#420000', glassBorder: '#300000', isDark: true, gradientColors: ['#0a0000', '#1a0000', '#3e2723'] },
  neon: { primary: '#ccff00', background: '#050505', surface: 'rgba(20,20,20,0.8)', surfaceHighlight: 'rgba(204,255,0,0.1)', text: '#ccff00', textSecondary: '#888888', accent: '#e5ff80', border: 'rgba(204,255,0,0.3)', glassBorder: 'rgba(204,255,0,0.1)', isDark: true, gradientColors: ['#000000', '#050505', '#1a1a1a'] },
  cyberpunk: { primary: '#f3f315', background: '#050a1a', surface: 'rgba(0,243,255,0.05)', surfaceHighlight: 'rgba(255,0,255,0.1)', text: '#f3f315', textSecondary: '#00f3ff', accent: '#ff00ff', border: '#f3f31588', glassBorder: '#00f3ff44', isDark: true, gradientColors: ['#050a1a', '#001233', '#000000'] },
  deep_blue: { primary: '#2979ff', background: '#00040a', surface: 'rgba(0,18,61,0.8)', surfaceHighlight: '#002663', text: '#e3f2fd', textSecondary: '#90caf9', accent: '#448aff', border: '#002663', glassBorder: '#001333', isDark: true, gradientColors: ['#00040a', '#000c1f', '#0d47a1'] },
  deep_purple: { primary: '#9c27b0', background: '#08001a', surface: 'rgba(18,0,60,0.8)', surfaceHighlight: '#330066', text: '#f3e5f5', textSecondary: '#ce93d8', accent: '#ba68c8', border: '#330066', glassBorder: '#1a0040', isDark: true, gradientColors: ['#08001a', '#12003c', '#4a148c'] },
  deep_red: { primary: '#c62828', background: '#120000', surface: 'rgba(32,0,0,0.8)', surfaceHighlight: '#400000', text: '#ffebee', textSecondary: '#ef9a9a', accent: '#e53935', border: '#400000', glassBorder: '#2a0000', isDark: true, gradientColors: ['#0a0000', '#120000', '#310000'] },
  deep_teal: { primary: '#00695c', background: '#000d0b', surface: 'rgba(0,26,22,0.8)', surfaceHighlight: '#00332a', text: '#e0f2f1', textSecondary: '#80cbc4', accent: '#00897b', border: '#00332a', glassBorder: '#00211a', isDark: true, gradientColors: ['#000d0b', '#001a16', '#004d40'] },
  deep_orange: { primary: '#e65100', background: '#0d0400', surface: 'rgba(26,13,0,0.8)', surfaceHighlight: '#421a00', text: '#fff3e0', textSecondary: '#ffcc80', accent: '#ef6c00', border: '#421a00', glassBorder: '#291100', isDark: true, gradientColors: ['#0d0400', '#1a0d00', '#e6510033'] },
  matrix: { primary: '#00ff41', background: '#000000', surface: 'rgba(0,17,0,0.85)', surfaceHighlight: '#004400', text: '#00ff41', textSecondary: '#008f11', accent: '#003b00', border: '#004400', glassBorder: '#002200', isDark: true, gradientColors: ['#000000', '#001100', '#002200'] },
  dracula: { primary: '#bd93f9', background: '#282a36', surface: 'rgba(68,71,90,0.85)', surfaceHighlight: '#6272a4', text: '#f8f8f2', textSecondary: '#6272a4', accent: '#50fa7b', border: '#44475a', glassBorder: 'rgba(189,147,249,0.1)', isDark: true, gradientColors: ['#282a36', '#44475a', '#282a36'] },
  nord_dark: { primary: '#88c0d0', background: '#2e3440', surface: 'rgba(59,66,82,0.85)', surfaceHighlight: '#4c566a', text: '#eceff4', textSecondary: '#d8dee9', accent: '#81a1c1', border: '#4c566a', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#2e3440', '#3b4252', '#434c5e'] },
  synthwave: { primary: '#ff7edb', background: '#1a0633', surface: 'rgba(45,11,90,0.7)', surfaceHighlight: '#720b98', text: '#f4eee1', textSecondary: '#36f9f6', accent: '#fe7171', border: '#720b98', glassBorder: 'rgba(255,126,219,0.2)', isDark: true, gradientColors: ['#1a0633', '#2d0b5a', '#000000'] },
  obsidian: { primary: '#ffab00', background: '#0e0e0e', surface: 'rgba(26,26,26,0.9)', surfaceHighlight: '#333333', text: '#ffffff', textSecondary: '#aaaaaa', accent: '#ffd600', border: '#333333', glassBorder: '#222222', isDark: true, gradientColors: ['#0a0a0a', '#0e0e0e', '#1a1a1a'] },
  charcoal: { primary: '#cfd8dc', background: '#121212', surface: 'rgba(30,30,30,0.85)', surfaceHighlight: '#333333', text: '#eceff1', textSecondary: '#b0bec5', accent: '#90a4ae', border: '#333333', glassBorder: '#222222', isDark: true, gradientColors: ['#121212', '#1e1e1e', '#2c2c2c'] },
  espresso: { primary: '#d7ccc8', background: '#1a0f0e', surface: 'rgba(45,27,26,0.85)', surfaceHighlight: '#4e342e', text: '#efebe9', textSecondary: '#a1887f', accent: '#8d6e63', border: '#4e342e', glassBorder: '#382220', isDark: true, gradientColors: ['#1a0f0e', '#2d1b1a', '#3e2723'] },
  blood_moon: { primary: '#ff1744', background: '#0a0000', surface: 'rgba(20,0,0,0.85)', surfaceHighlight: '#600000', text: '#ffebee', textSecondary: '#ef5350', accent: '#d32f2f', border: '#600000', glassBorder: '#300000', isDark: true, gradientColors: ['#0a0000', '#1a0000', '#310000'] },
  toxic: { primary: '#39ff14', background: '#000d00', surface: 'rgba(0,26,0,0.85)', surfaceHighlight: '#004a00', text: '#39ff14', textSecondary: '#20c20e', accent: '#00ff41', border: '#004a00', glassBorder: '#002600', isDark: true, gradientColors: ['#000000', '#000d00', '#001a00'] },
  electric: { primary: '#0070ff', background: '#00050d', surface: 'rgba(0,17,38,0.85)', surfaceHighlight: '#002b5c', text: '#e0f0ff', textSecondary: '#66b2ff', accent: '#0099ff', border: '#002b5c', glassBorder: '#001936', isDark: true, gradientColors: ['#00050d', '#001126', '#000000'] },
  royal_dark: { primary: '#ffd700', background: '#050014', surface: 'rgba(10,0,41,0.85)', surfaceHighlight: '#1a0042', text: '#fcf8e3', textSecondary: '#c5a059', accent: '#daa520', border: '#1a0042', glassBorder: '#0d0033', isDark: true, gradientColors: ['#050014', '#0a0029', '#0d0033'] },
  emerald_dark: { primary: '#00ff88', background: '#000d07', surface: 'rgba(0,26,15,0.85)', surfaceHighlight: '#004024', text: '#e0fff0', textSecondary: '#00cc6a', accent: '#00ffaa', border: '#004024', glassBorder: '#002616', isDark: true, gradientColors: ['#000d07', '#001a0f', '#002616'] },
  ruby: { primary: '#ff0033', background: '#0d0003', surface: 'rgba(26,0,6,0.85)', surfaceHighlight: '#4d0012', text: '#ffe0e6', textSecondary: '#ff4d6d', accent: '#ff0055', border: '#4d0012', glassBorder: '#260009', isDark: true, gradientColors: ['#0d0003', '#1a0006', '#260009'] },
  sapphire: { primary: '#0f52ba', background: '#000612', surface: 'rgba(0,17,43,0.85)', surfaceHighlight: '#002b6b', text: '#e0f0ff', textSecondary: '#4169e1', accent: '#1e90ff', border: '#002b6b', glassBorder: '#001940', isDark: true, gradientColors: ['#000612', '#00112b', '#001940'] },
  twilight: { primary: '#f48fb1', background: '#0d020d', surface: 'rgba(26,4,26,0.85)', surfaceHighlight: '#400a40', text: '#fce4ec', textSecondary: '#f06292', accent: '#ec407a', border: '#400a40', glassBorder: '#260626', isDark: true, gradientColors: ['#0d020d', '#1a041a', '#260626'] },

  // --- 10 LIGHT THEMES ---
  white: { primary: '#1e88e5', background: '#f5f5f5', surface: 'rgba(255,255,255,0.9)', surfaceHighlight: '#eeeeee', text: '#1a1a1a', textSecondary: '#666666', accent: '#1565c0', border: 'rgba(30,136,229,0.2)', glassBorder: 'rgba(0,0,0,0.05)', isDark: false, gradientColors: ['#f5f5f5', '#ffffff', '#f5f5f5'] },
  snow: { primary: '#9e9e9e', background: '#ffffff', surface: 'rgba(255,255,255,0.95)', surfaceHighlight: '#f0f0f0', text: '#212121', textSecondary: '#757575', accent: '#bdbdbd', border: '#e0e0e0', glassBorder: '#f5f5f5', isDark: false, gradientColors: ['#ffffff', '#fcfcfc', '#ffffff'] },
  sky: { primary: '#0288d1', background: '#e1f5fe', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#b3e5fc', text: '#01579b', textSecondary: '#039be5', accent: '#40c4ff', border: '#81d4fa', glassBorder: '#e1f5fe', isDark: false, gradientColors: ['#e1f5fe', '#ffffff', '#b3e5fc'] },
  mint: { primary: '#00796b', background: '#e0f2f1', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#b2dfdb', text: '#004d40', textSecondary: '#00897b', accent: '#4db6ac', border: '#80cbc4', glassBorder: '#e0f2f1', isDark: false, gradientColors: ['#e0f2f1', '#ffffff', '#b2dfdb'] },
  rose: { primary: '#c2185b', background: '#fce4ec', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#f8bbd0', text: '#880e4f', textSecondary: '#d81b60', accent: '#f06292', border: '#f48fb1', glassBorder: '#fce4ec', isDark: false, gradientColors: ['#fce4ec', '#ffffff', '#f8bbd0'] },
  lemon: { primary: '#fbc02d', background: '#fffde7', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#fff9c4', text: '#f57f17', textSecondary: '#fbc02d', accent: '#fff176', border: '#fff59d', glassBorder: '#fffde7', isDark: false, gradientColors: ['#fffde7', '#ffffff', '#fff9c4'] },
  peach: { primary: '#e64a19', background: '#fff3e0', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#ffe0b2', text: '#bf360c', textSecondary: '#f4511e', accent: '#ff8a65', border: '#ffab91', glassBorder: '#fff3e0', isDark: false, gradientColors: ['#fff3e0', '#ffffff', '#ffe0b2'] },
  lavender: { primary: '#512da8', background: '#f3e5f5', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#e1bee7', text: '#311b92', textSecondary: '#5e35b1', accent: '#9575cd', border: '#b39ddb', glassBorder: '#f3e5f5', isDark: false, gradientColors: ['#f3e5f5', '#ffffff', '#e1bee7'] },
  sakura: { primary: '#e91e63', background: '#fff0f5', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#ffc1d1', text: '#880e4f', textSecondary: '#ec407a', accent: '#f48fb1', border: '#ffc1d1', glassBorder: '#fff0f5', isDark: false, gradientColors: ['#fff0f5', '#ffffff', '#ffc1d1'] },
  nord_light: { primary: '#5e81ac', background: '#e5e9f0', surface: 'rgba(236,239,244,0.9)', surfaceHighlight: '#d8dee9', text: '#2e3440', textSecondary: '#434c5e', accent: '#81a1c1', border: '#d8dee9', glassBorder: '#eceff4', isDark: false, gradientColors: ['#e5e9f0', '#eceff4', '#d8dee9'] },
};

interface ThemeContextType {
  colors: ThemeColors;
  spacing: any;
  borderRadius: any;
  currentMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('black');

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(val => {
      if (val) setMode(val as ThemeMode);
    });
  }, []);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem('themeMode', newMode);
  };

  const value = {
    colors: themes[mode] || themes['black'],
    spacing: baseSpacing,
    borderRadius: baseBorderRadius,
    currentMode: mode,
    setThemeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: themes[mode]?.background || '#000' }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};
