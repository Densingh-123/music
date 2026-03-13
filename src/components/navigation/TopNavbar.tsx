import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  useWindowDimensions, Alert, Modal,
  Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/theme/AuthContext';
import GlassCard from '../ui/GlassCard';

export default function TopNavbar() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const isDesktop = width >= 900;

  if (!isDesktop) return null;

  // Get user initial for avatar
  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 2) {
      (navigation as any).navigate('Main', { 
        screen: 'SearchTab', 
        params: { query: searchQuery } 
      });
      setSearchQuery('');
    } else {
      (navigation as any).navigate('Main', { screen: 'Search' });
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleDropdownItem = (label: string, route?: string, params?: any) => {
    setShowDropdown(false);
    if (label === 'Logout') {
      signOut();
      return;
    }
    if (route) {
      (navigation as any).navigate(route, params);
    }
  };

  return (
    <View style={[
      styles.navbar, 
      { 
        paddingTop: insets.top,
        borderBottomColor: theme.colors.glassBorder,
      }
    ]}>
      {/* Glass background */}
      <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.navbarInner, { borderBottomColor: theme.colors.glassBorder }]}>
        <Pressable 
          onPress={() => (navigation as any).navigate('Main', { screen: 'Home' })} 
          style={styles.brand}
        >
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary + '44' }]}>
            <Ionicons name="musical-notes" size={28} color={theme.colors.primary} />
          </View>
          <Text style={[styles.brandText, { color: theme.colors.text }]}>BloomeeTunes</Text>
        </Pressable>

        {/* Desktop Links (Reduced) */}
        <View style={styles.desktopNavLinks}>
          <Pressable onPress={() => (navigation as any).navigate('Ringtones')} style={styles.topNavLink}>
            <Text style={[styles.topNavLinkText, { color: theme.colors.textSecondary }]}>Ringtones</Text>
          </Pressable>
          <Pressable onPress={() => (navigation as any).navigate('Main', { screen: 'LibraryTab' })} style={styles.topNavLink}>
            <Text style={[styles.topNavLinkText, { color: theme.colors.textSecondary }]}>Library</Text>
          </Pressable>
        </View>

        {/* Center Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: theme.colors.glassBorder }]}>
            <Ionicons name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: theme.colors.text, outline: 'none' } as any]}
              placeholder="Search songs, artists, albums..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                const state = navigation.getState();
                const currentRoute = state?.routes?.[state?.index]?.name;
                if (currentRoute !== 'Main' || (state?.routes?.[state?.index] as any).params?.screen !== 'SearchTab') {
                  (navigation as any).navigate('Main', { screen: 'SearchTab' });
                }
              }}
              onSubmitEditing={handleSearchSubmit}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Right Side Icons */}
        <View style={styles.rightActions}>
          <Pressable 
            onPress={() => (navigation as any).navigate('Settings')} 
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
          </Pressable>

          {/* Profile Button */}
          <View>
            <Pressable 
              onPress={toggleDropdown} 
              style={[styles.profileCircle, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.profileInitial}>{userInitial}</Text>
            </Pressable>

            {showDropdown && (
              <Modal transparent visible={showDropdown} animationType="fade" statusBarTranslucent>
                <Pressable onPress={() => setShowDropdown(false)} style={styles.modalOverlay}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                      <View style={[styles.dropdown, { borderColor: theme.colors.glassBorder }]}>
                        {/* Dropdown glass background */}
                        <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFillObject} />
                        <View style={[styles.dropdownBg, { backgroundColor: 'rgba(12,12,16,0.92)' }]} />
                        
                        {/* User info header */}
                        <View style={styles.dropdownHeader}>
                          <View style={[styles.dropdownAvatar, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.dropdownAvatarText}>{userInitial}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.dropdownName, { color: theme.colors.text }]} numberOfLines={1}>
                              {userDisplayName}
                            </Text>
                            <Text style={[styles.dropdownEmail, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                              {userEmail}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.dropdownDivider, { backgroundColor: theme.colors.glassBorder }]} />

                        {[
                          { label: 'Liked Songs', icon: 'heart-outline', route: 'LikedSongs' },
                          { label: 'Recently Played', icon: 'time-outline', route: 'RecentlyPlayed' },
                          { label: 'Library', icon: 'library-outline', route: 'Library' },
                          { label: 'Downloads', icon: 'download-outline', route: 'Downloads' },
                          { label: 'Settings', icon: 'settings-outline', route: 'Settings' },
                        ].map((item, idx) => (
                          <Pressable
                            key={idx}
                            style={({ pressed }) => [
                              styles.dropdownItem, 
                              pressed && { backgroundColor: 'rgba(255,255,255,0.06)' }
                            ]}
                            onPress={() => handleDropdownItem(item.label, item.route)}
                          >
                            <Ionicons name={item.icon as any} size={17} color={theme.colors.textSecondary} />
                            <Text style={[styles.dropdownText, { color: theme.colors.text }]}>{item.label}</Text>
                          </Pressable>
                        ))}

                        <View style={[styles.dropdownDivider, { backgroundColor: theme.colors.glassBorder }]} />

                        <Pressable
                          style={({ pressed }) => [
                            styles.dropdownItem, 
                            pressed && { backgroundColor: 'rgba(255,68,68,0.08)' }
                          ]}
                          onPress={() => handleDropdownItem('Logout')}
                        >
                          <Ionicons name="log-out-outline" size={17} color="#ff5555" />
                          <Text style={[styles.dropdownText, { color: '#ff5555' }]}>Logout</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                </Pressable>
              </Modal>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'relative',
    zIndex: 1000,
    overflow: 'hidden',
  },
  navbarInner: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  desktopNavLinks: {
    flexDirection: 'row',
    gap: 20,
    marginLeft: 20,
  },
  topNavLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topNavLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    maxWidth: 520,
    marginHorizontal: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    right: 24,
    width: 230,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 16px 40px rgba(0,0,0,0.6)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 28,
        elevation: 20,
      }
    }),
  },
  dropdownBg: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  dropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  dropdownEmail: {
    fontSize: 11,
  },
  dropdownDivider: {
    height: 1,
    marginHorizontal: 0,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
