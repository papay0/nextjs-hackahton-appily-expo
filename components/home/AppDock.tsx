import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import AppIcon from './AppIcon';
import { AppData } from './AppGrid';

interface AppDockProps {
  apps: AppData[];
  onAppPress?: (app: AppData) => void;
}

export default function AppDock({ apps, onAppPress }: AppDockProps) {
  
  return (
    <View style={styles.dockContainer}>
      <BlurView intensity={25} tint="dark" style={styles.dockWrapper}>
        <View style={styles.dockContent}>
          {apps.map((app) => (
            <AppIcon
              key={app.id}
              name={app.name}
              icon={app.icon}
              url={app.url}
              onPress={() => onAppPress && onAppPress(app)}
              inDock={true}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    width: '90%',
    marginBottom: 110, // Increased to add more space above tab bar
    alignSelf: 'center',
  },
  dockWrapper: {
    width: '100%',
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(40, 40, 50, 0.3)',
  },
  dockContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  }
}); 