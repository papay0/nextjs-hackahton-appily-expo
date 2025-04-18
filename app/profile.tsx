import React from 'react';
import { Stack, useRouter } from 'expo-router';
import ProfileScreen from '@/components/Profile';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          presentation: "modal",
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16, padding: 8 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          gestureEnabled: true,
        }}
      />
      <ProfileScreen />
    </>
  );
} 