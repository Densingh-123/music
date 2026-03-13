import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import RingtoneScreen from '../screens/RingtoneScreen';
import { useWindowDimensions } from 'react-native';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, focused, label }: any) => {
  const theme = useTheme();
  return (
    <View style={styles.tabItem}>
      {focused && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />}
      <Ionicons name={name} size={focused ? 24 : 22} color={color} />
      <Text style={[styles.tabLabel, { color, fontWeight: focused ? '700' : '500' }]}>{label}</Text>
    </View>
  );
};

export default function TabNavigator() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768; // Tablet and up

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: isLarge ? 'none' : 'flex',
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 75,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} color={color} focused={focused} label="Search" />
          ),
        }}
      />
      <Tab.Screen
        name="RingtonesTab"
        component={RingtoneScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} focused={focused} label="Ringtones" />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'library' : 'library-outline'} color={color} focused={focused} label="Library" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 20,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
