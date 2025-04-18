import React from 'react';
import { Stack } from 'expo-router';
import InternalSettingsScreen from '@/components/InternalSettings';

export default function InternalSettings() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <InternalSettingsScreen />
    </>
  );
} 