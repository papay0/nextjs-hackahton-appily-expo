import React from 'react';
import { Stack } from 'expo-router';

export default function BuildLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="build-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="prompt-enhancement"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 