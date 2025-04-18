import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function OAuthCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoaded) return;
    
    // Simple redirection based on auth status
    const timer = setTimeout(() => {
      if (isSignedIn) {
        // Route to the main tabs, which will show the build tab first
        router.replace('/(tabs)');
      } else {
        // Route back to login if auth failed
        router.replace('/(auth)/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    gap: 16,
  },
  text: {
    color: 'white',
    fontSize: 16,
  }
}); 