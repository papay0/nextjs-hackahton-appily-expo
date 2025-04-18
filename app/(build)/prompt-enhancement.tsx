import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { EnhancementHeader } from '@/components/prompt-enhancement/EnhancementHeader';
import { FeatureCheckList } from '@/components/prompt-enhancement/FeatureCheckList';
import PermissionsList from '@/components/prompt-enhancement/PermissionsList';
import { enhancePrompt, EnhancedPromptResponse } from '@/services/api';
import 'react-native-get-random-values'; // Import before uuid
import { v4 as uuidv4 } from 'uuid';

// Module-level variable to store enhanced data between screens
let _cachedEnhancedData: EnhancedPromptResponse | null = null;

// Function to store and retrieve enhanced data
export function storeEnhancedData(data: EnhancedPromptResponse): void {
  _cachedEnhancedData = data;
}

export function getEnhancedData(): EnhancedPromptResponse | null {
  return _cachedEnhancedData;
}

export default function PromptEnhancementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [projectId] = useState(params.projectId as string || uuidv4());
  const [originalPrompt] = useState(params.prompt as string || '');
  const [model] = useState(params.model as string || 'anthropic/claude-3.7-sonnet');
  
  // State to store enhanced prompt data
  const [enhancedData, setEnhancedData] = useState<EnhancedPromptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch enhanced prompt data on component mount
  useEffect(() => {
    if (!originalPrompt) {
      setError('No prompt provided');
      setLoading(false);
      return;
    }
    
    async function fetchEnhancedPrompt() {
      try {
        setLoading(true);
        const data = await enhancePrompt(originalPrompt);
        setEnhancedData(data);
        setError(null);
      } catch (err) {
        console.error('Error enhancing prompt:', err);
        setError('Failed to enhance prompt. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEnhancedPrompt();
  }, [originalPrompt]);
  
  // Handle toggling a feature on/off
  const handleToggleFeature = (index: number) => {
    if (!enhancedData) return;
    
    setEnhancedData(prevData => {
      if (!prevData) return null;
      
      const updatedFeatures = [...prevData.enhancedPrompt];
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        checked: !updatedFeatures[index].checked
      };
      
      return {
        ...prevData,
        enhancedPrompt: updatedFeatures
      };
    });
  };
  
  // Handle adding a custom feature
  const handleAddFeature = (featureText: string) => {
    if (!enhancedData) return;
    
    setEnhancedData(prevData => {
      if (!prevData) return null;
      
      // Create a new feature item
      const newFeature = {
        displayContent: "Custom Feature",
        content: featureText,
        checked: true
      };
      
      // Add to the list of features
      return {
        ...prevData,
        enhancedPrompt: [...prevData.enhancedPrompt, newFeature]
      };
    });
  };
  
  // Handle updating the project summary
  const handleUpdateSummary = (summary: string) => {
    if (!enhancedData) return;
    
    setEnhancedData(prevData => {
      if (!prevData) return null;
      
      return {
        ...prevData,
        projectSummary: summary
      };
    });
  };
  
  // Navigate to build details screen with enhanced data
  const handleContinue = () => {
    if (!enhancedData || !projectId) return;
    
    // Make sure permissions use valid keys
    // This step ensures we only use permission types that our system can actually handle
    const validPermissionTypes = ['camera', 'microphone', 'location', 'mediaLibrary', 'storage', 'notifications', 'backgroundLocation'];
    const filteredPermissions = enhancedData.requiredPermissions.filter(
      perm => validPermissionTypes.includes(perm)
    );
    
    // Create a modified version of the enhanced data with filtered permissions
    const sanitizedEnhancedData = {
      ...enhancedData,
      requiredPermissions: filteredPermissions
    };
    
    // Navigate to build details screen
    router.navigate({
      pathname: "/(build)/build-details",
      params: {
        projectId,
        prompt: originalPrompt,
        model,
        enhanced: 'true', // Flag to indicate we're using enhanced prompt
      }
    });
    
    // Store the enhanced data in a better way that doesn't use global
    // We'll use a module-level variable since we can't use context without wrapping the app
    // In a real app, you'd use a state management library like Redux or Zustand
    storeEnhancedData(sanitizedEnhancedData);
  };

  // Navigate using original prompt (without enhancements)
  const handleUseOriginalPrompt = () => {
    if (!projectId) return;
    
    // Show confirmation dialog
    Alert.alert(
      "Use Original Prompt",
      "This will use your original prompt without any enhancements or feature selection. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Continue", 
          onPress: () => {
            // Navigate to build details without enhancement flag
            router.navigate({
              pathname: "/(build)/build-details",
              params: {
                projectId,
                prompt: originalPrompt,
                model,
                // No enhanced flag means it will use original prompt only
              }
            });
          }
        }
      ]
    );
  };
  
  // Handle going back to the input screen
  const handleBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Background elements */}
      <AnimatedBackground particleCount={30} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Customize Your App</Text>
          
          <View style={{ width: 40 }} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Analyzing your request...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleBack}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : enhancedData ? (
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Project summary - now with editing capability */}
            <EnhancementHeader 
              projectSummary={enhancedData.projectSummary} 
              originalPrompt={enhancedData.originalPrompt} 
              onUpdateSummary={handleUpdateSummary}
            />
            
            {/* Feature selection - no longer has an internal ScrollView */}
            <FeatureCheckList 
              features={enhancedData.enhancedPrompt} 
              onToggleFeature={handleToggleFeature} 
              onAddFeature={handleAddFeature}
            />
            
            {/* Permission list */}
            {enhancedData.requiredPermissions && enhancedData.requiredPermissions.length > 0 && (
              <PermissionsList 
                requiredPermissions={enhancedData.requiredPermissions} 
              />
            )}
            
            {/* Action buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* Use Original Prompt Button */}
              <TouchableOpacity 
                style={styles.originalPromptButton}
                onPress={handleUseOriginalPrompt}
              >
                <Text style={styles.originalPromptText}>Use Original Prompt</Text>
                <Ionicons name="document-text-outline" size={16} color="#94A3B8" />
              </TouchableOpacity>
              
              {/* Continue with Enhanced Prompt Button */}
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Continue with Enhancements</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>No Data Available</Text>
            <Text style={styles.errorText}>We couldn't process your request. Please try again.</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleBack}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Action buttons styles
  actionButtonsContainer: {
    marginTop: 16,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    width: '100%',
  },
  originalPromptText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    marginRight: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
}); 