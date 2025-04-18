import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStorage, ref, listAll, deleteObject, StorageReference } from 'firebase/storage';

export default function InternalSettingsScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteAllStorage = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Delete All Storage',
      'Are you sure you want to delete all files in Firebase Storage? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // Get reference to the storage
              const storage = getStorage();
              const rootRef = ref(storage);
              
              // List all items
              const listResult = await listAll(rootRef);
              
              // Delete all items (files)
              const deletePromises = listResult.items.map(itemRef => {
                return deleteObject(itemRef);
              });
              
              // Delete all items in all prefixes (folders) recursively
              const processFolders = async (prefixes: StorageReference[]) => {
                for (const folderRef of prefixes) {
                  const folderListResult = await listAll(folderRef);
                  
                  // Delete files in folder
                  const folderDeletePromises = folderListResult.items.map(itemRef => {
                    return deleteObject(itemRef);
                  });
                  
                  await Promise.all(folderDeletePromises);
                  
                  // Process nested folders recursively
                  if (folderListResult.prefixes.length > 0) {
                    await processFolders(folderListResult.prefixes);
                  }
                }
              };
              
              // Process all folders
              await processFolders(listResult.prefixes);
              
              // Wait for all delete operations to complete
              await Promise.all(deletePromises);
              
              setIsDeleting(false);
              Alert.alert('Success', 'All storage files have been deleted successfully.');
            } catch (error: any) {
              console.error('Error deleting storage:', error);
              setIsDeleting(false);
              Alert.alert('Error', `Failed to delete all storage files: ${error.message || 'Unknown error'}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
        <Text style={styles.headerTitle}>Internal Settings</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Admin Controls</Text>
          <Text style={styles.sectionDescription}>
            Advanced settings for administrators only
          </Text>
        </View>
        
        {/* Storage Management */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Storage Management</Text>
          <Text style={styles.sectionDescription}>
            Manage Firebase Storage data
          </Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
            <Text style={styles.dangerZoneDescription}>
              These actions are destructive and cannot be undone
            </Text>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAllStorage}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.dangerButtonText}>Deleting...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.dangerButtonText}>Delete All Storage Files</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  dangerZone: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 14,
    color: '#F87171',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 