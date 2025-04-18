import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
// Initialize Firebase
import '../lib/firebase';
import { FirebaseAuthProvider } from '@/lib/firebase-auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SplashScreen as AppSplashScreen } from '@/components/ui/SplashScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Secret key from Clerk Dashboard
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// This hook will protect the route access based on user authentication
function useProtectedRoute(isSignedIn: boolean | undefined) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // If auth isn't loaded yet, don't do anything
    if (isSignedIn === undefined) return;
    
    // Check if the path/segment starts with "auth"
    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      // If the user is not signed in and the initial segment is not (auth)
      // Redirect to the login page
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      // If the user is signed in and the initial segment is (auth)
      // Redirect to the tabs
      router.replace('/(tabs)');
    }
  }, [isSignedIn, segments, router]);
}

// Initial layout with Clerk Provider
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showingSplash, setShowingSplash] = useState(true);

  useEffect(() => {
    if (loaded) {
      // Hide the native splash screen
      SplashScreen.hideAsync();
      
      // Keep our custom splash screen visible for a bit longer
      const timer = setTimeout(() => {
        setShowingSplash(false);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || showingSplash) {
    return <AppSplashScreen />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <FirebaseAuthProvider>
        <AuthenticatedLayout />
      </FirebaseAuthProvider>
    </ClerkProvider>
  );
}

// This component handles the authentication state and renders the appropriate layout
function AuthenticatedLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();
  
  // Use the useProtectedRoute hook to handle routing based on auth state
  useProtectedRoute(isSignedIn);

  // If Clerk is still loading, show nothing to prevent layout shifting
  if (!isLoaded) {
    return <AppSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
