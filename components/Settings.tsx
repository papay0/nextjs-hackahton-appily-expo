import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useUser } from '@clerk/clerk-expo';
import { getUserProfile, User } from '@/lib/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'undetermined' | 'loading'>('loading');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  useEffect(() => {
    // Check microphone permission status on component mount
    checkMicrophonePermission();
    
    // Load user profile if user is authenticated
    if (isClerkLoaded && clerkUser) {
      loadUserProfile();
    }
  }, [isClerkLoaded, clerkUser]);
  
  // Function to load user profile and check for admin role
  const loadUserProfile = async () => {
    if (!clerkUser) return;
    
    setIsLoadingProfile(true);
    try {
      const profile = await getUserProfile(clerkUser.id);
      setUserProfile(profile);
      
      // Check if user has admin role
      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  // Function to check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      setMicrophonePermission('loading');
      const { status } = await Audio.getPermissionsAsync();
      
      if (status === 'granted') {
        setMicrophonePermission('granted');
      } else if (status === 'denied') {
        setMicrophonePermission('denied');
      } else {
        setMicrophonePermission('undetermined');
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicrophonePermission('denied');
      Alert.alert('Error', 'Failed to check microphone permission');
    }
  };
  
  // Function to request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      setMicrophonePermission('loading');
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status === 'granted') {
        setMicrophonePermission('granted');
      } else {
        setMicrophonePermission('denied');
        Alert.alert(
          'Permission Required', 
          'Microphone access is required for audio recording features. Please enable it in your device settings.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setMicrophonePermission('denied');
      Alert.alert('Error', 'Failed to request microphone permission');
    }
  };

  // Navigate to internal settings
  const navigateToInternalSettings = () => {
    router.push('/internal-settings');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Manual header with close button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          <Text style={styles.sectionDescription}>
            Manage permissions required for app functionality
          </Text>
        </View>
        
        {/* Permissions List */}
        <View style={styles.card}>
          {/* Microphone Permission */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="mic" size={20} color="#3B82F6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.permissionTitle}>Microphone</Text>
                <Text style={styles.permissionDescription}>
                  Required for voice recording features
                </Text>
              </View>
            </View>
            
            <View style={styles.permissionControl}>
              {microphonePermission === 'loading' ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : microphonePermission === 'granted' ? (
                <View style={styles.permissionGranted}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.permissionGrantedText}>Granted</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestMicrophonePermission}
                  activeOpacity={0.7}
                >
                  <Text style={styles.permissionButtonText}>
                    {microphonePermission === 'denied' ? 'Enable' : 'Request'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        
        {/* Admin Only Section */}
        {isAdmin && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Administrator Controls</Text>
              <Text style={styles.sectionDescription}>
                Advanced settings for administrators only
              </Text>
            </View>
            
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={navigateToInternalSettings}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
                    <Ionicons name="construct" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.settingTitle}>Internal Settings</Text>
                    <Text style={styles.settingDescription}>
                      Admin-only configuration options
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderView: {
    width: 36, // Same width as close button for balance
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  permissionControl: {
    marginLeft: 8,
  },
  permissionGranted: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionGrantedText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
}); 