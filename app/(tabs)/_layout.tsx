import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Alert, View, Text } from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      // Execute the signOut function - this internally handles clearing credentials
      await signOut();
      
      // After successful sign out, redirect to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        'Sign Out Error',
        'There was a problem signing out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleSignOut} 
            style={{ 
              marginRight: 15,
              padding: 8,  // Larger touch target
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
            activeOpacity={0.6}  // Visual feedback on press
          >
            <Ionicons 
              name="log-out-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 90,
          },
          android: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 70,
          },
          default: {
            borderTopWidth: 0,
          },
        }),
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Build',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hammer.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Appily Store',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />, 
        }}
      />
    </Tabs>
  );
}
