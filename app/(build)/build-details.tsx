import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatTab from '@/components/build-details/ChatTab';
import CodeTab from '@/components/build-details/CodeTab';
import LiveLogsTab from '@/components/build-details/LiveLogsTab';
import PreviewTab from '@/components/build-details/PreviewTab';
import 'react-native-get-random-values'; // This needs to be imported before uuid
import { v4 as uuidv4 } from 'uuid';
import { triggerGeneration } from '@/services/api';
import { useSharedProjectData } from '@/hooks/useSharedProjectData';
// Import function to get enhanced data
import { getEnhancedData } from './prompt-enhancement';

type TabType = 'chat' | 'code' | 'logs' | 'preview';

export default function BuildDetailsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [projectId, setProjectId] = useState<string>('');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Load shared project data
  const projectData = useSharedProjectData(projectId);
  
  // Initialize projectId from URL params or generate a new one
  useEffect(() => {
    const id = params.projectId as string;
    if (id && id.length > 0) {
      setProjectId(id);
    } else {
      // Generate a new project ID if none is provided
      setProjectId(uuidv4());
    }
  }, [params.projectId]);

  // Check if the assistant is currently responding (check project status)
  const isAssistantResponding = useMemo(() => {
    // Get status from the project document
    const status = projectData.status.value;
    return status === 'initializing' || status === 'generating';
  }, [projectData.status.value]);

  // Reusable function to handle generation (initial or follow-up)
  const handleGeneration = useCallback(async (prompt: string) => {
    if (!projectId || !prompt) return;
    
    // Check if we're using enhanced prompt data
    const isEnhanced = params.enhanced === 'true';
    const enhancedDataRaw = isEnhanced ? getEnhancedData() : null;
    // Convert null to undefined to match the expected type
    const enhancedData = enhancedDataRaw || undefined;
    
    console.log('Triggering generation for project', {
      projectId,
      prompt,
      model: params.model || 'anthropic/claude-3.7-sonnet',
      isEnhanced
    });
    
    try {
      // Make the API call to start generation, passing enhanced data if available
      await triggerGeneration(
        prompt,
        projectId,
        (params.model as string) || 'anthropic/claude-3.7-sonnet',
        false, // Don't enhance prompt on backend (we already did it)
        enhancedData // Pass the enhanced data if available
      );
      return true;
    } catch (error) {
      console.error('Error during generation:', error);
      return false;
    }
  }, [projectId, params.model, params.enhanced]);

  // Trigger initial generation when the screen loads with a prompt parameter
  useEffect(() => {
    if (projectId && params.prompt && projectData.messages.data.length === 0) {
      handleGeneration(params.prompt as string);
    }
  }, [projectId, params.prompt, handleGeneration, projectData.messages.data.length]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header with back button and tabs */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'chat' && styles.activeTab
            ]}
            onPress={() => setActiveTab('chat')}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name="chatbubble-outline" 
                size={18} 
                color={activeTab === 'chat' ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'code' && styles.activeTab]}
            onPress={() => setActiveTab('code')}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name="code-outline" 
                size={18} 
                color={activeTab === 'code' ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
            onPress={() => setActiveTab('logs')}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name="terminal-outline" 
                size={18} 
                color={activeTab === 'logs' ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preview' && styles.activeTab]}
            onPress={() => setActiveTab('preview')}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name="globe-outline" 
                size={18} 
                color={activeTab === 'preview' ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Content - Keep all tabs mounted but hide inactive ones */}
      <View style={styles.content}>
        <View style={[styles.tabContentContainer, { display: activeTab === 'chat' ? 'flex' : 'none' }]}>
          <ChatTab 
            projectId={projectId} 
            initialPrompt={params.prompt as string}
            messages={projectData.messages.data}
            loading={projectData.messages.loading}
            error={projectData.messages.error}
            onSendMessage={handleGeneration}
            isAssistantResponding={isAssistantResponding}
          />
        </View>
        
        <View style={[styles.tabContentContainer, { display: activeTab === 'code' ? 'flex' : 'none' }]}>
          <CodeTab 
            projectId={projectId}
            codeFiles={projectData.codeFiles.data}
            loading={projectData.codeFiles.loading}
            error={projectData.codeFiles.error}
          />
        </View>
        
        <View style={[styles.tabContentContainer, { display: activeTab === 'logs' ? 'flex' : 'none' }]}>
          <LiveLogsTab 
            projectId={projectId}
            logs={projectData.logs.data}
            loading={projectData.logs.loading}
            error={projectData.logs.error}
          />
        </View>
        
        <View style={[styles.tabContentContainer, { display: activeTab === 'preview' ? 'flex' : 'none' }]}>
          <PreviewTab 
            projectId={projectId}
            resultData={projectData.result.data}
            loading={projectData.result.loading}
            error={projectData.result.error}
          />
        </View>
      </View>
    </View>
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 100,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    flex: 1,
  },
}); 