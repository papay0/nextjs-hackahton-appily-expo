import React from 'react';
import { Stack } from 'expo-router';

export default function ProjectsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="history"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 