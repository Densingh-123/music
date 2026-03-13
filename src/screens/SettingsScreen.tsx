import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/src/theme/AuthContext';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOut();
      }}
    ]);
  };

  const SETTINGS_GROUPS = [
    {
      title: 'Personalization',
      items: [
        { label: 'Appearance & Themes', icon: 'color-palette', color: '#ff4081', screen: 'Themes' },
        { label: 'Audio Quality', icon: 'musical-note', color: '#00e676', screen: 'SettingsDetail' },
      ]
    },
    {
      title: 'Account & Privacy',
      items: [
        { label: 'Account Profile', icon: 'person', color: '#2196f3', screen: 'SettingsDetail' },
        { label: 'Privacy & Security', icon: 'shield-checkmark', color: '#ff9800', screen: 'SettingsDetail' },
        { label: 'Notifications', icon: 'notifications', color: '#f44336', screen: 'SettingsDetail' },
      ]
    },
    {
      title: 'Content & storage',
      items: [
        { label: 'Downloads', icon: 'download', color: '#00bcd4', screen: 'Downloads' },
        { label: 'Storage Usage', icon: 'harddisk', color: '#673ab7', screen: 'SettingsDetail', iconLib: 'MaterialCommunityIcons' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & Support', icon: 'help-circle', color: '#9c27b0', screen: 'SettingsDetail' },
        { label: 'Chat with Us', icon: 'chatbubbles', color: '#4caf50', screen: 'SupportChat' },
        { label: 'About BloomeeTunes', icon: 'information-circle', color: '#607d8b', screen: 'SettingsDetail' },
      ]
    }
  ];

  const renderItem = (item: any) => (
    <Pressable
      key={item.label}
      onPress={() => {
        if (item.screen === 'SettingsDetail') {
          (navigation as any).navigate('SettingsDetail', { 
            title: item.label, 
            icon: item.icon, 
            color: item.color 
          });
        } else {
          (navigation as any).navigate(item.screen);
        }
      }}
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: pressed ? theme.colors.surfaceHighlight : theme.colors.surface }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        {item.iconLib === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
        ) : (
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        )}
      </View>
      <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );

  return (
    <GlassContainer style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        </View>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard} intensity={20}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.displayName || 'User'}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
            <View style={[styles.premiumBadge, { backgroundColor: '#FFD70030' }]}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[styles.premiumText, { color: '#FFD700' }]}>Premium Member</Text>
            </View>
          </View>
        </GlassCard>

        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>{group.title}</Text>
            <View style={[styles.groupContent, { borderColor: theme.colors.border }]}>
              {group.items.map(renderItem)}
            </View>
          </View>
        ))}

        <Pressable 
          onPress={handleLogout}
          style={[styles.logoutBtn, { borderColor: '#ff4444' }]}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.colors.textSecondary }]}>BloomeeTunes v2.1.0</Text>
          <Text style={[styles.madeWith, { color: theme.colors.textSecondary }]}>Made with ❤️ for music lovers</Text>
        </View>
      </ScrollView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupContent: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 10,
    gap: 10,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  madeWith: {
    fontSize: 11,
  },
});
