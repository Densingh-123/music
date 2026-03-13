import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import PlayerScreen from '@/src/screens/PlayerScreen';
import PlaylistDetailScreen from '@/src/screens/PlaylistDetailScreen';
import LoginScreen from '@/src/screens/LoginScreen';
import RegisterScreen from '@/src/screens/RegisterScreen';
import LikedSongsScreen from '@/src/screens/LikedSongsScreen';
import NotificationsScreen from '@/src/screens/NotificationsScreen';
import SettingsScreen from '@/src/screens/SettingsScreen';
import RecentlyPlayedScreen from '@/src/screens/RecentlyPlayedScreen';
import SettingsDetailScreen from '@/src/screens/SettingsDetailScreen';
import ArtistDetailScreen from '@/src/screens/ArtistDetailScreen';
import SupportChatScreen from '@/src/screens/SupportChatScreen';
import ThemesScreen from '@/src/screens/ThemesScreen';
import RingtoneScreen from '@/src/screens/RingtoneScreen';
import DownloadsScreen from '@/src/screens/DownloadsScreen';
import MiniPlayer from '@/src/components/MiniPlayer';
import TopNavbar from '@/src/components/navigation/TopNavbar';
import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/theme/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Home: undefined;
  Search: { query?: string };
  Library: undefined;
  LikedSongs: undefined;
  Player: undefined;
  PlaylistDetail: { name: string; id: string; query?: string; color?: string; icon?: string; isLikedStack?: boolean };
  Notifications: undefined;
  Settings: undefined;
  RecentlyPlayed: undefined;
  SettingsDetail: { title: string; icon: string; color: string };
  ArtistDetail: { artist: string };
  SupportChat: undefined;
  Themes: undefined;
  Ringtones: undefined;
  Downloads: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.accent,
        },
        fonts: {
          regular: { fontFamily: '', fontWeight: 'normal' },
          medium: { fontFamily: '', fontWeight: '500' },
          bold: { fontFamily: '', fontWeight: 'bold' },
          heavy: { fontFamily: '', fontWeight: '900' },
        }
      }}
    >
      {user && <TopNavbar />}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <>
            <Stack.Group
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="LikedSongs" 
                component={LikedSongsScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Player"
                component={PlayerScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom'
                }}
              />
              <Stack.Screen
                name="PlaylistDetail"
                component={PlaylistDetailScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="RecentlyPlayed" component={RecentlyPlayedScreen} />
              <Stack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
              <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
              <Stack.Screen name="SupportChat" component={SupportChatScreen} />
              <Stack.Screen name="Themes" component={ThemesScreen} />
              <Stack.Screen name="Ringtones" component={RingtoneScreen} />
              <Stack.Screen name="Downloads" component={DownloadsScreen} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
      {user && <MiniPlayer />}
    </NavigationContainer>
  );
}
