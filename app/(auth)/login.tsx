import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';

import { useAuth, useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AppilyLogo } from '@/components/ui/AppilyLogo';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Required for OAuth with Clerk and Expo
WebBrowser.maybeCompleteAuthSession();

// Preload browser for better auth performance
export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

export default function LoginScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Warm up browser for better auth performance
  useWarmUpBrowser();

  // If user is already signed in, redirect to the home page
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle Google sign in - defined outside of conditional rendering to avoid hook errors
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Start the authentication process using SSO flow
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For myself: the correct url is exp://localhost:8081/--/callback for dev and appily://callback for prod
        redirectUrl: AuthSession.makeRedirectUri(
            {
                scheme: 'appily',
                path: "callback",
                preferLocalhost: true
            }
        ),
      });
      
      // If sign in was successful, set the active session
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        
        // Route to the main tabs interface after successful login
        router.replace('/(tabs)');
      } else {
        // If there are missing requirements, like MFA, you can handle them here
        // using the signIn or signUp objects returned from startSSOFlow
        console.log("Additional steps required:", { signIn, signUp });
        setError('Additional authentication steps required. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Google sign in error: ", err);
      setError('Failed to initialize Google sign in. Please try again.');
      setLoading(false);
    }
  }, [startSSOFlow, router]);

  // Show loading if Clerk is still initializing
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background elements */}
      <AnimatedBackground particleCount={30} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header with logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <AppilyLogo size={30} color="#FEC237" />
            </View>
          </View>

          {/* Main content */}
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <AnimatedGradientText
                textStyle="title"
                style={styles.title}
                colors={['#3B82F6', '#0EA5E9', '#38BDF8']}
              >
                What do you want to build?
              </AnimatedGradientText>
              <Text style={styles.subtitle}>
                Sign in to start building your app
              </Text>
            </View>

            {/* Google Sign In button */}
            <View style={styles.formContainer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <>
                    <Image 
                      source={require('@/assets/images/google-logo.png')}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark blue background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
}); 