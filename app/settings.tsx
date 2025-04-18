import React from 'react';
import { Stack } from 'expo-router';
import SettingsScreen from '@/components/Settings';

export default function Settings() {
  
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SettingsScreen />
    </>
  );
} 