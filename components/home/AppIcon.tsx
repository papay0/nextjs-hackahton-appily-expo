import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface AppIconProps {
  name: string;
  icon: string;
  url?: string;
  onPress?: () => void;
  inDock?: boolean;
}

export default function AppIcon({ name, icon, url, onPress, inDock = false }: AppIconProps) {
  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else if (url) {
      // Open URL if provided
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  };

  return (
    <View style={[
      styles.container,
      inDock && styles.dockContainer,
    ]}>
      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        {Platform.OS === 'ios' ? (
          <BlurView 
            intensity={inDock ? 10 : 20} 
            tint="dark" 
            style={[
              styles.iconContainer,
              inDock && styles.dockIconContainer,
            ]}
          >
            <Text style={[
              styles.iconText,
              inDock && styles.dockIconText,
            ]}>
              {icon}
            </Text>
          </BlurView>
        ) : (
          <View style={[
            styles.iconContainer,
            inDock && styles.dockIconContainer,
          ]}>
            <Text style={[
              styles.iconText,
              inDock && styles.dockIconText,
            ]}>
              {icon}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {!inDock && (
        <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 110,
    alignItems: 'center',
    marginVertical: 6,
  },
  dockContainer: {
    width: 65,
    height: 55,
    marginVertical: 0,
    marginHorizontal: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 13,
    backgroundColor: 'rgba(40, 40, 50, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  dockIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(50, 50, 60, 0.5)',
  },
  iconText: {
    fontSize: 30,
  },
  dockIconText: {
    fontSize: 26,
  },
  nameText: {
    fontSize: 12,
    color: 'white',
    marginTop: 8,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 75,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
}); 