import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Pressable, ScrollView, 
  Switch, Image, Platform, useWindowDimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '@/src/services/firebaseConfig';

export default function SettingsDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { title, icon, color } = (route.params as any) || { title: 'Settings', icon: 'settings', color: '#6200ea' };

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: false,
    autoDownload: false,
    highQuality: true,
    history: true,
    incognito: false,
  });

  const toggleSwitch = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggle = (label: string, key: string, desc: string) => (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 20 }}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: theme.colors.textSecondary }]}>{desc}</Text>
      </View>
      <Switch
        value={toggles[key]}
        onValueChange={() => toggleSwitch(key)}
        trackColor={{ false: '#3e3e3e', true: theme.colors.primary }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#f4f3f4'}
      />
    </View>
  );

  const renderContent = () => {
    switch (title) {
      case 'Account Profile':
        return (
          <View>
            <GlassCard intensity={20} style={styles.sectionCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.largeAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.avatarText}>{auth.currentUser?.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <Pressable style={[styles.editBtn, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Edit Profile</Text>
                </Pressable>
              </View>
              
              <View style={styles.detailList}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>{auth.currentUser?.email}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Display Name</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>{auth.currentUser?.displayName || 'Not Set'}</Text>
                </View>
                <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Account Status</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.primary }]}>Premium Verified</Text>
                </View>
              </View>
            </GlassCard>
            
            <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>Danger Zone</Text>
            <Pressable style={[styles.dangerBtn, { borderColor: '#ff4444' }]}>
              <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Delete Account</Text>
            </Pressable>
          </View>
        );

      case 'Audio Quality':
        return (
          <View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' }} 
              style={[styles.heroImage, { height: width >= 900 ? 320 : 180 }]} 
            />
            <GlassCard intensity={20} style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Streaming Quality</Text>
              {['Auto (Recommended)', 'High (320kbps)', 'Normal (160kbps)', 'Data Saver (96kbps)'].map((q, i) => (
                <Pressable key={q} style={styles.radioRow}>
                  <Text style={{ color: i === 1 ? theme.colors.primary : theme.colors.text, fontWeight: i === 1 ? '700' : '500' }}>{q}</Text>
                  {i === 1 && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
                </Pressable>
              ))}
              <View style={styles.divider} />
              {renderToggle('Normalize Volume', 'vol', 'Keep same volume level for all songs')}
              {renderToggle('Mono Audio', 'mono', 'Combine left and right audio channels')}
            </GlassCard>
          </View>
        );

      case 'Privacy & Security':
        return (
          <View>
            <GlassCard intensity={20} style={styles.sectionCard}>
              <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
                <Text style={[styles.infoBoxText, { color: theme.colors.text }]}>
                  Your data is encrypted end-to-end. We don't sell your personal information.
                </Text>
              </View>
              {renderToggle('Listening History', 'history', 'Allow us to save what you play to improve recommendations')}
              {renderToggle('Incognito Mode', 'incognito', 'Hide your activity from your friends and public profile')}
              <View style={styles.divider} />
              <Pressable style={styles.actionRow}>
                <Text style={{ color: theme.colors.text }}>Manage Connected Apps</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </Pressable>
              <Pressable style={styles.actionRow}>
                <Text style={{ color: theme.colors.text }}>Download My Data</Text>
                <Ionicons name="download-outline" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </GlassCard>
          </View>
        );

      case 'Notifications':
        return (
          <View>
            <GlassCard intensity={20} style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Alert Preferences</Text>
              {renderToggle('Push Notifications', 'push', 'Get alerts about new releases and updates')}
              {renderToggle('Email Newsletter', 'email', 'Receive weekly charts and staff picks in your inbox')}
              <View style={styles.divider} />
              {renderToggle('Artist Updates', 'artist', 'Get notified when artists you follow release new music')}
              {renderToggle('Playlist Updates', 'plist', 'Notifications for songs added to your favorite playlists')}
            </GlassCard>
          </View>
        );

      case 'Storage Usage':
        return (
          <View>
            <GlassCard intensity={20} style={styles.sectionCard}>
              <View style={styles.storageStats}>
                <Text style={[styles.storageTotal, { color: theme.colors.text }]}>1.2 GB used</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { backgroundColor: theme.colors.primary, width: '40%' }]} />
                </View>
                <View style={styles.storageLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Downloads (480MB)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#555' }]} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cache (720MB)</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <Pressable style={styles.actionRow}>
                <Text style={{ color: theme.colors.text }}>Clear Cache</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Reclaims 720MB</Text>
              </Pressable>
              {renderToggle('Smart Downloads', 'sd', 'Automatically download your most played songs')}
            </GlassCard>
          </View>
        );

      case 'About BloomeeTunes':
        return (
          <View style={{ alignItems: 'center' }}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' }} 
              style={[styles.heroImage, { borderRadius: 30, height: 200, marginBottom: 20 }]} 
            />
            <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>BloomeeTunes</Text>
            <Text style={[styles.aboutVersion, { color: theme.colors.primary }]}>Version 2.4.0 (Stable)</Text>
            <Text style={[styles.aboutDesc, { color: theme.colors.textSecondary }]}>
              Built with passion for the next generation of music listeners. 
              Our mission is to provide a seamless, beautiful, and ad-free experience 
              across all your devices.
            </Text>
            <GlassCard intensity={20} style={[styles.sectionCard, { width: '100%' }]}>
              <Pressable style={styles.actionRow}>
                <Text style={{ color: theme.colors.text }}>Terms of Service</Text>
                <Ionicons name="open-outline" size={18} color={theme.colors.textSecondary} />
              </Pressable>
              <Pressable style={styles.actionRow}>
                <Text style={{ color: theme.colors.text }}>Privacy Policy</Text>
                <Ionicons name="open-outline" size={18} color={theme.colors.textSecondary} />
              </Pressable>
              <Pressable style={[styles.actionRow, { borderBottomWidth: 0 }]}>
                <Text style={{ color: theme.colors.text }}>Open Source Licenses</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </GlassCard>
            <Text style={[styles.madeBy, { color: theme.colors.textSecondary }]}>Designed & Built by Antigravity Team</Text>
          </View>
        );

      case 'Help & Support':
        return (
          <View>
             <GlassCard intensity={20} style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Common Questions</Text>
                {['How to download songs?', 'Can I use multiple devices?', 'Changing payment method'].map(q => (
                  <Pressable key={q} style={styles.actionRow}>
                    <Text style={{ color: theme.colors.text }}>{q}</Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                  </Pressable>
                ))}
             </GlassCard>
             <Pressable 
                style={[styles.chatBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => (navigation as any).navigate('SupportChat')}
              >
                <Ionicons name="chatbubbles" size={24} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.chatBtnText}>Chat with Support AI</Text>
              </Pressable>
          </View>
        );

      default:
        return (
          <View style={styles.placeholder}>
            <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 20 }}>More features coming soon</Text>
          </View>
        );
    }
  };

  return (
    <GlassContainer style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + (width >= 900 ? 80 : 16) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 24,
  },
  sectionCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailList: {
    marginTop: 10,
  },
  detailItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    paddingLeft: 4,
    marginBottom: 10,
    opacity: 0.6,
  },
  dangerBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 16,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  storageStats: {
    alignItems: 'center',
    marginBottom: 10,
  },
  storageTotal: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageLegend: {
    flexDirection: 'row',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  aboutVersion: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  aboutDesc: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  madeBy: {
    fontSize: 12,
    marginTop: 20,
    opacity: 0.7,
  },
  chatBtn: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.3)' },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      }
    }),
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
  }
});
