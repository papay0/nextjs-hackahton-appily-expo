import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useFirebaseAuth } from '@/lib/firebase-auth';
import { getUserProfile, updateUserProfile, createUserProfile, User } from '@/lib/user';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { firebaseUser, isFirebaseLoading, firebaseError } = useFirebaseAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!isClerkLoaded || !clerkUser) {
        console.log("User not loaded yet");
        return;
      }
      
      // Wait until Firebase auth is ready
      if (isFirebaseLoading) {
        console.log("Firebase auth is still loading...");
        return;
      }
      
      // Check for Firebase authentication errors
      if (firebaseError) {
        console.error("Firebase auth error:", firebaseError);
        setError(`Firebase authentication failed: ${firebaseError.message}`);
        setIsLoading(false);
        return;
      }
      
      // Make sure user is authenticated with Firebase
      if (!firebaseUser) {
        console.log("Firebase user is null, authentication required");
        setError("You need to be authenticated with Firebase to access your profile.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Try to get existing profile
        let userProfile = await getUserProfile(clerkUser.id);
        
        // If no profile exists, create one with Clerk data
        if (!userProfile) {
          const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';
          
          userProfile = await createUserProfile({
            id: clerkUser.id,
            displayName: clerkUser.fullName || clerkUser.username || '',
            email: primaryEmail,
            photoURL: clerkUser.imageUrl || '',
          });
        }
        
        setProfile(userProfile);
        // Initialize form with profile data (prioritize Firebase data if available, fall back to Clerk data)
        setFormData({
          displayName: userProfile.displayName || clerkUser.fullName || clerkUser.username || '',
          email: userProfile.email || (clerkUser.emailAddresses?.[0]?.emailAddress || ''),
          bio: userProfile.bio || '',
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [clerkUser, isClerkLoaded, firebaseUser, isFirebaseLoading, firebaseError]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!clerkUser || !firebaseUser) {
      setError("You need to be authenticated to update your profile");
      return;
    }
    
    setIsSaving(true);
    try {
      const updatedProfile = await updateUserProfile(clerkUser.id, {
        displayName: formData.displayName,
        email: formData.email,
        bio: formData.bio,
      });
      
      setProfile(updatedProfile);
      setError(null);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  if (!isClerkLoaded || isLoading || isFirebaseLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!clerkUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>You need to be signed in to view your profile</Text>
      </View>
    );
  }
  
  if (error || firebaseError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.errorCard}>
          <Text style={styles.errorCardTitle}>Authentication Error</Text>
          <Text style={styles.errorCardDescription}>
            There was a problem authenticating with Firebase
          </Text>
          <Text style={styles.errorText}>
            {error || firebaseError?.message || "Unknown authentication error"}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setError(null)}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.placeholderView} />
          </View>
          
          <Text style={styles.subtitle}>
            Manage your personal information and profile settings
          </Text>
          
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {clerkUser.imageUrl ? (
                  <Image 
                    source={{ uri: clerkUser.imageUrl }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>
                      {(clerkUser.fullName?.[0] || clerkUser.username?.[0] || "U").toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.displayName || clerkUser.fullName || clerkUser.username || "User"}
                </Text>
                <Text style={styles.profileEmail}>
                  {profile?.email || clerkUser.emailAddresses?.[0]?.emailAddress || ""}
                </Text>
              </View>
            </View>
            
            <Text style={styles.profileBio}>
              {profile?.bio || "No bio provided. Edit your profile to add one."}
            </Text>
          </View>
          
          {/* Edit Profile Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Edit Profile</Text>
            <Text style={styles.formDescription}>Update your profile information</Text>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={formData.displayName}
                onChangeText={(text) => handleChange('displayName', text)}
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Your email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                Note: This doesn't change your account email, just how it appears on your profile
              </Text>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChangeText={(text) => handleChange('bio', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, isSaving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Settings Section */}
          <TouchableOpacity
            style={styles.settingsCard}
            onPress={navigateToSettings}
            activeOpacity={0.7}
          >
            <View style={styles.settingsContent}>
              <View style={styles.settingsIconContainer}>
                <Ionicons name="settings-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.settingsTextContainer}>
                <Text style={styles.settingsTitle}>Settings</Text>
                <Text style={styles.settingsDescription}>App permissions, preferences, and more</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholderView: {
    width: 36, // Same width as close button for balance
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  errorCard: {
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 20,
  },
  errorCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorCardDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  profileCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  avatarFallback: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  profileBio: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#64748B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 13,
    color: '#94A3B8',
  },
}); 