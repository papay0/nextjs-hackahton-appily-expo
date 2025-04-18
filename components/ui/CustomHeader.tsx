import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppilyLogo } from './AppilyLogo';
import { useUser } from '@clerk/clerk-expo';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightIcon?: IoniconsName;
  onRightIconPress?: () => void;
  transparent?: boolean;
  avatarUrl?: string;
  onAvatarPress?: () => void;
  showHistoryButton?: boolean;
  onHistoryPress?: () => void;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  rightIcon,
  onRightIconPress,
  transparent = false,
  avatarUrl,
  onAvatarPress,
  showHistoryButton = false,
  onHistoryPress
}) => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  
  // Use the user's image from Clerk if available, otherwise use the provided avatarUrl or a default
  const userAvatarUrl = user?.imageUrl || avatarUrl;
  
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHistoryPress = () => {
    if (onHistoryPress) {
      onHistoryPress();
    } else {
      // For now we'll just log that we need to implement history
      console.log('History button pressed - need to implement history screen');
    }
  };

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      // Navigate to the profile page if no custom handler is provided
      router.push('/profile');
    }
  };

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top },
      transparent ? styles.transparentContainer : styles.blurContainer
    ]}>
      {!transparent && (
        <BlurView 
          intensity={80} 
          tint="dark" 
          style={StyleSheet.absoluteFillObject} 
        />
      )}
      
      <View style={styles.content}>
        {/* Left side - Back button or History icon */}
        <View style={styles.logoContainer}>
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : showHistoryButton ? (
            <TouchableOpacity 
              style={styles.historyButton} 
              onPress={handleHistoryPress}
            >
              <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoCircle}>
              <AppilyLogo size={30} color="#FEC237" />
            </View>
          )}
        </View>
        
        {/* Title in the middle (optional) */}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
        
        {/* Avatar on the right */}
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleAvatarPress}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: userAvatarUrl }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  historyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
}); 