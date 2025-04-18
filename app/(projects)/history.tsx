import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { Swipeable } from 'react-native-gesture-handler';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';

interface Project {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  projectSummary: string;
  status: 'initializing' | 'generating' | 'complete' | 'failed' | null;
}

export default function HistoryScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());
  
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Create a reference to the projects collection
      const projectsRef = collection(db, 'projects');
      
      // Create a query against the collection
      const projectsQuery = query(
        projectsRef,
        where('ownerId', '==', user.id),
        orderBy('updatedAt', 'desc')
      );
      
      // Execute the query
      const querySnapshot = await getDocs(projectsQuery);
      
      // Map the documents to our Project interface
      const projectsList: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsList.push({
          id: doc.id,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          projectSummary: data.projectSummary,
          status: data.status,
        });
      });
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'initializing':
        return '#60A5FA'; // Light blue
      case 'generating':
        return '#FBBF24'; // Amber
      case 'complete':
        return '#34D399'; // Green
      case 'failed':
        return '#F87171'; // Red
      default:
        return '#94A3B8'; // Gray for null or unknown status
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'initializing':
        return 'time-outline';
      case 'generating':
        return 'cog-outline';
      case 'complete':
        return 'checkmark-circle-outline';
      case 'failed':
        return 'alert-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'initializing':
        return 'Initializing';
      case 'generating':
        return 'Generating';
      case 'complete':
        return 'Complete';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: '/(build)/build-details',
      params: { projectId }
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const deleteProjectFiles = async (projectId: string) => {
    try {
      const storage = getStorage();
      const projectStoragePath = `projects/${projectId}`;
      const projectRef = ref(storage, projectStoragePath);
      
      // Recursively list and delete all files in the project storage path
      const deleteFilesRecursively = async (folderRef: any) => {
        try {
          const listResult = await listAll(folderRef);
          
          // Delete all files in the current directory
          await Promise.all(listResult.items.map(itemRef => deleteObject(itemRef)));
          
          // Recursively delete files in subdirectories
          await Promise.all(
            listResult.prefixes.map(prefix => deleteFilesRecursively(prefix))
          );
        } catch (error) {
          console.error('Error in recursive delete:', error);
          throw error;
        }
      };
      
      await deleteFilesRecursively(projectRef);
      return true;
    } catch (error) {
      console.error('Error deleting project files from storage:', error);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (deleting) return; // Prevent multiple deletion attempts
    
    try {
      setDeleting(projectId);
      
      // Delete from Firestore
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      
      // Delete from Storage
      await deleteProjectFiles(projectId);
      
      // Update UI
      setProjects(current => current.filter(project => project.id !== projectId));
      
      // Clear the deleting state
      setDeleting(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert(
        'Error',
        'Failed to delete the project. Please try again later.'
      );
      setDeleting(null);
    }
  };

  const confirmDelete = (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Close the swipeable
            const swipeable = swipeableRefs.current.get(projectId);
            if (swipeable) {
              swipeable.close();
            }
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProject(projectId)
        }
      ],
      { cancelable: true }
    );
  };

  const formatDate = (timestamp: Timestamp) => {
    try {
      // Convert Firestore Timestamp to JavaScript Date
      const date = timestamp.toDate();
      
      // Format the date
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    } catch {
      return 'Invalid date';
    }
  };

  const renderRightActions = (projectId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => confirmDelete(projectId)}
      >
        {deleting === projectId ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            <Text style={styles.deleteActionText}>Delete</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Project }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item.id, ref);
        }
      }}
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() => handleProjectPress(item.id)}
        activeOpacity={0.7}
        disabled={deleting === item.id}
      >
        <View style={styles.projectContent}>
          <Text style={styles.projectId}>Project {item.projectSummary}</Text>
          
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={14} 
              color={getStatusColor(item.status)} 
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              Status: {getStatusLabel(item.status)}
            </Text>
          </View>
          
          <Text style={styles.timestamp}>
            Updated {formatDate(item.updatedAt)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Background animation */}
      <AnimatedBackground particleCount={30} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <AnimatedGradientText textStyle="title" style={styles.title}>
          History
        </AnimatedGradientText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#3B82F6" size="large" />
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyText}>No project history yet</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 16 }
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Matching the dark blue from other screens
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 16,
    marginBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  projectContent: {
    flex: 1,
  },
  projectId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
}); 