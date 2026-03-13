import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, 
  useWindowDimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import GlassContainer from '@/src/components/ui/GlassContainer';
import GlassCard from '@/src/components/ui/GlassCard';
import BlobBackground from '@/src/components/ui/BlobBackground';
import { auth, db } from '@/src/services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDesktop = width >= 900;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Persistence is already set to browserLocalPersistence in firebaseConfig.ts
        // Directly call popup login
        await signInWithPopup(auth, provider);
      } else {
        Alert.alert('Google Sign-In', 'Google Sign-In for native is coming soon! Please use email/password for now.');
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      let msg = error.message;
      if (error.code === 'auth/popup-blocked') {
        msg = "Pop-up blocked! Please allow pop-ups for this site in your browser settings and try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        msg = "Unauthorized Domain! This website's address is not authorized in Firebase Console. Please add it to 'Authorized Domains'.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        msg = "Login popup was closed before completion. Please try again.";
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = "Google Login is not enabled in Firebase Console. Please enable it in 'Authentication -> Sign-in method'.";
      }
      Alert.alert('Google Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <BlobBackground />
      <GlassContainer 
        style={styles.outerContainer}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <GlassCard intensity={40} style={[styles.loginCard, isDesktop && { width: 500, maxWidth: 500 }]}>
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="musical-notes" size={40} color="#fff" />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Login to continue your musical journey</Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.glassBorder }]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.glassBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                underlineColorAndroid="transparent"
              />
            </View>

            <Pressable 
              onPress={handleLogin} 
              style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login</Text>}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.colors.glassBorder }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.glassBorder }]} />
            </View>

            <Pressable 
              onPress={handleGoogleLogin} 
              style={[styles.googleBtn, { borderColor: theme.colors.glassBorder }]}
            >
              <Ionicons name="logo-google" size={20} color={theme.colors.text} />
              <Text style={[styles.googleBtnText, { color: theme.colors.text }]}>Continue with Google</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={{ color: theme.colors.textSecondary }}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Register' as never)}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Register</Text>
              </Pressable>
            </View>
          </View>
        </GlassCard>
        </KeyboardAvoidingView>
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  loginCard: {
    width: '90%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 30,
    borderWidth: 1,
    boxShadow: '0px 20px 30px rgba(0, 0, 0, 0.4)',
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  loginBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
