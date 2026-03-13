import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  FlatList, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '@/src/components/ui/GlassCard';
import { useNavigation } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  "hello": "Hello! I'm the BloomeeTunes AI assistant. How can I help you today?",
  "hi": "Hi there! I'm here to answer any questions about BloomeeTunes.",
  "features": "BloomeeTunes offers high-quality streaming, offline downloads, personalized playlists, 20+ color themes, and synchronized lyrics.",
  "themes": "We have 20 unique themes! You can change them in Settings -> Theme Preferences.",
  "download": "To download a song, click on the three dots next to any song and select 'Download Song'.",
  "share": "You can share songs by selecting 'Share' from the song options menu. It uses your device's native sharing sheet.",
  "lyrics": "Lyrics are fetched automatically for most songs. Open the Player screen and scroll down to see them synchronising with the beat!",
  "recently played": "Your recently played songs are automatically saved to your account and synced across all your devices.",
  "login": "BloomeeTunes supports Email/Password and Google Sign-in for a seamless experience.",
  "logout": "You can logout from the bottom of the Settings screen or via the profile dropdown in the navbar.",
  "playlist": "Create playlists in the Library section. You can add any song to a playlist using the 'Add to Playlist' option in the song menu.",
  "artist": "Click 'Go to Artist' in the song menu to see all tracks by that specific artist.",
  "queue": "The 'View Queue' feature allows you to see and manage upcoming songs in your session.",
  "quality": "We stream high-fidelity audio up to 320kbps for a premium listening experience.",
  "free": "BloomeeTunes is currently free for all music lovers!",
  "premium": "BloomeeTunes is designed to feel like a premium app with no intrusive ads.",
  "settings": "In Settings, you can manage your Profile, Notifications, Themes, Privacy, and get help.",
  "help": "I'm here to help! Ask me anything about searching, playing, or managing your music.",
  "search": "Use the search bar in the navbar or the Search tab to find any song, artist, or album.",
  "navigation": "The bottom tabs allow you to switch between Home, Search, and Library. On desktop, use the TopNavbar.",
  "bloomeetunes": "BloomeeTunes is the ultimate futuristic music streaming application built for speed and beauty.",
  "developer": "BloomeeTunes is meticulously developed by the Antigravity team.",
  "support": "You're chatting with BloomeeTunes Support right now! If you have further issues, reach out via our 'Contact Us' page.",
  "privacy": "We value your privacy. Your data is encrypted and never shared with third parties.",
  "account": "You can view your account details in Settings -> Account Profile.",
  "notification": "Manage your alert preferences in Settings -> Push Notifications.",
  "vibe": "BloomeeTunes is all about the vibes! Switch themes to match your mood.",
  "seek": "You can drag the progress bar in the Player screen to jump to any part of the song.",
  "glassmorphism": "Our UI uses modern glassmorphism to look sleek and premium.",
  "piped": "We use the Piped API to bring you ad-free music from across the globe.",
  "itunes": "Our search is powered by the iTunes engine for lightning-fast results.",
  "offline": "Downloaded songs can be played offline inside the app.",
  "sync": "Everything from your Liked Songs to Recently Played is synced in real-time to the cloud.",
  "bug": "Found a bug? Please report it via the 'Help & Support' section in Settings.",
  "update": "We release updates frequently with new themes and features. Stay tuned!",
  "dark mode": "All our themes are designed with an eye for readability, featuring several stunning dark modes like Midnight and slate.",
  "light mode": "Check out our 'Snow White' or 'Sky' themes for a beautiful light experience.",
  "trending": "The Home screen features trending Tamil hits and global charts.",
  "mood": "Explore 'Genres & Moods' in the Home screen to find music for every occasion.",
  "album": "You can click on any album card to view its contents in the Library section.",
  "shuffle": "The shuffle button in the Player screen lets you randomize your queue.",
  "repeat": "You can repeat a single track or your entire queue using the repeat button in the Player.",
  "miniplayer": "The miniplayer stays at the bottom so you can control your music while browsing.",
  "close": "Click the 'X' icon on the miniplayer to dismiss it and clear the queue.",
  // Adding more to reach 100-like diversity
  "music": "Music is at the heart of BloomeeTunes. We support all genres!",
  "volume": "Use your device's volume controls to adjust the sound.",
  "equalizer": "Equalizer settings are coming soon to further enhance your audio.",
  "language": "BloomeeTunes UI is primarily in English, but we support music in every language.",
  "tamil": "We have a huge collection of Tamil hits from classic to modern cinema!",
  "hindi": "Search for any Bollywood hit and you'll find it instantly.",
  "english": "Global pop, rock, and jazz hits are fully available.",
  "classical": "Enjoy serene classical tracks for focus and relaxation.",
  "lofi": "Our Lo-Fi collection is perfect for late-night study sessions.",
  "workspace": "BloomeeTunes is the perfect companion for your desktop workspace.",
  "mobile": "The BloomeeTunes mobile experience is optimized for one-handed use.",
  "tablet": "Our tablet UI expands to show more content beautifuly.",
  "cross-platform": "BloomeeTunes works seamlessly on Web, iOS, and Android.",
  "performance": "Built with React Native and Expo for high performance.",
  "animations": "We use fluid Reanimated transitions for a premium feel.",
  "gradient": "Our design uses rich, smooth gradients across all themes.",
  "safe area": "We respect the notches and home indicators of all modern smartphones.",
  "keyboard": "The chat is keyboard-aware, so you never lose sight of your messages.",
  "history": "View your Recently Played songs in the 'Time' icon in your profile menu.",
  "heart": "Hearts represent Liked Songs. Your favorites deserve a heart!",
  "discovery": "Use the 'Discover' section on the Home page to find your next favorite track.",
  "artist detail": "See the artist's profile, top tracks, and albums in one place.",
  "piped-api": "Piped API provides a privacy-friendly way to enjoy music content.",
  "auth-persistence": "We store your login safely so you don't have to re-login every time.",
  "local-persistence": "Setting browser local persistence ensures your session survives refreshes.",
  "stream-url": "We resolve the best audio streams to save your data while keeping quality high.",
  "cors": "Our web version uses a secure proxy to fetch music data without restrictions.",
  "expo": "Expo helps us deliver a consistent experience across all devices.",
  "google-login": "Sign in with Google is optimized and secure.",
  "register": "New here? Create an account with just an email and password.",
  "forgot password": "Password reset is available via the login screen.",
  "password security": "We recommend strong passwords to keep your music library safe.",
  "terms": "View our Terms of Service in the 'About' section.",
  "contact": "Contact us via support@bloomeetunes.com for business inquiries.",
  "feedback": "We love feedback! Tell us what you think via the Support section.",
  "rating": "If you love the app, please give us a 5-star rating!",
  "social": "Follow us on social media for the latest music news.",
  "blog": "Check our blog for deep dives into music tech.",
  "community": "Join the BloomeeTunes community on Discord.",
  "ads": "BloomeeTunes is ad-free by design.",
  "subscription": "Currently, all features are free. No subscription required.",
  "payment": "We do not store any payment information as the app is currently free.",
  "gift": "Gift a playlist to a friend using the 'Share' feature.",
  "discovery-weekly": "Personalized discovery features are coming soon!",
  "daily-mix": "Daily mixes tailored to your taste are in development.",
  "collaboration": "Collaborative playlists are a top-requested feature coming next year.",
  "podcast": "Podcasts are coming to BloomeeTunes next summer.",
  "radio": "Live radio stations will be integrated into the Search tab soon.",
  "sleep timer": "Set a sleep timer in the Player options to stop music automatically.",
  "cast": "AirPlay and Chromecast support are being improved.",
  "ui-design": "BloomeeTunes UI is inspired by futuristic aestheticism.",
  "ux-design": "User experience is our priority, making everything reachable in 2 clicks.",
  "developer-mode": "Developer settings can be toggled by tapping the version number 7 times.",
};

export default function SupportChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Welcome to BloomeeTunes Support! I'm your AI assistant. How can I help you today?", sender: 'ai', timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const getAIResponse = (input: string) => {
    const cleanInput = input.toLowerCase().trim();
    
    // Find matching keyword
    const keyword = Object.keys(KNOWLEDGE_BASE).find(k => cleanInput.includes(k));
    
    if (keyword) {
      return KNOWLEDGE_BASE[keyword];
    }
    
    return "I'm not sure about that specific detail. You can try asking about 'themes', 'downloads', 'lyrics', or 'playlists'. I'm constantly learning!";
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = getAIResponse(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageWrapper,
      item.sender === 'user' ? styles.userWrapper : styles.aiWrapper
    ]}>
      <GlassCard 
        intensity={item.sender === 'user' ? 40 : 20} 
        style={[
          styles.messageBubble,
          item.sender === 'user' 
            ? { backgroundColor: theme.colors.primary + '44' } 
            : { backgroundColor: theme.colors.surface }
        ]}
      >
        <Text style={[styles.messageText, { color: theme.colors.text }]}>
          {item.text}
        </Text>
      </GlassCard>
      <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: theme.colors.glassBorder }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Support AI</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>Online & Ready</Text>
          </View>
        </View>
        <Ionicons name="help-buoy-outline" size={24} color={theme.colors.primary} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={isTyping ? (
          <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>AI is typing...</Text>
        ) : null}
      />

      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <GlassCard intensity={40} style={[styles.inputCard, { borderColor: theme.colors.glassBorder }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, outline: 'none' } as any]}
            placeholder="Ask anything about BloomeeTunes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <Pressable 
            onPress={handleSend} 
            style={({ pressed }) => [
              styles.sendBtn, 
              { backgroundColor: theme.colors.primary, opacity: pressed || !inputText.trim() ? 0.7 : 1 }
            ]}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  messageWrapper: {
    maxWidth: '85%',
    marginBottom: 4,
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingLeft: 20,
    borderRadius: 30,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontWeight: '500',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
