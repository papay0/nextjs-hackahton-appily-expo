import { auth } from '@/lib/firebase';
import { Platform } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Interface for enhanced prompt features
 */
export interface EnhancedPromptItem {
  displayContent: string; // Short title shown in UI checkbox
  content: string; // Detailed description of the enhancement
  checked: boolean; // Whether this item should be pre-selected
}

/**
 * Interface for the enhanced prompt response
 */
export interface EnhancedPromptResponse {
  originalPrompt: string; // Original user prompt
  projectSummary: string;
  enhancedPrompt: EnhancedPromptItem[];
  requiredPermissions: string[]; // Permissions needed for the app
}

/**
 * Get the backend API URL based on environment
 */
export function getBackendUrl(): string {
  // For a production mobile app, you'd typically use environment variables
  // or a configuration based on build type
  if (__DEV__ && Platform.OS === 'ios') {
    // During development on iOS simulator, localhost points to the Mac host
    // Use this for local testing with your backend
    const useLocalBackend = false; // Set to true to use local backend for testing
    if (useLocalBackend) {
      return 'http://localhost:3000';
    }
  }
  
  // Default to production backend
  return 'https://appily-agent-678356251626.us-central1.run.app';
}

/**
 * Validate Firebase user and get authentication token
 */
async function getAuthToken(): Promise<string> {
  if (!auth || !auth.currentUser) {
    throw new Error('Authentication required: Please sign in');
  }
  
  try {
    // Force refresh token to ensure it's not expired
    const token = await auth.currentUser.getIdToken(true);
    
    if (!token) {
      throw new Error('Empty authentication token received');
    }
    
    return token.trim();
  } catch (error) {
    console.error('Error getting authentication token:', error);
    throw new Error('Authentication error: Failed to get token');
  }
}

/**
 * Enhance a prompt to get feature suggestions
 * 
 * @param prompt - User's original prompt
 * @returns Enhanced prompt data with feature suggestions
 */
export async function enhancePrompt(prompt: string): Promise<EnhancedPromptResponse> {
  try {
    // Ensure the user is authenticated
    if (!auth || !auth.currentUser) {
      throw new Error('Authentication required: Please sign in');
    }
    
    console.log(`[API] Enhancing prompt: ${prompt}`);
    
    // Get the Firebase Functions instance
    const functions = getFunctions();
    
    // Create a callable reference to the enhancePrompt function
    const enhancePromptFunction = httpsCallable<{prompt: string}, EnhancedPromptResponse>(
      functions, 
      'enhancePrompt'
    );
    
    // Call the function with the prompt
    const result = await enhancePromptFunction({ prompt });
    
    // The result.data already has the EnhancedPromptResponse structure
    return result.data;
  } catch (error) {
    console.error('[API] Prompt enhancement error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Trigger code generation based on user prompt
 * 
 * @param prompt - User's message/prompt
 * @param projectId - Unique ID for the project
 * @param modelKey - AI model to use for generation
 * @param enhancePrompt - Whether to enhance the prompt on backend
 * @param enhancedData - Enhanced prompt data if available
 */
export async function triggerGeneration(
  prompt: string,
  projectId: string,
  modelKey: string = 'anthropic/claude-3.7-sonnet',
  enhancePrompt: boolean = false,
  enhancedData?: EnhancedPromptResponse
): Promise<{ projectId: string; initialStatus: string }> {
  try {
    // Get authentication token
    const authToken = await getAuthToken();
    
    // Prepare request
    const backendUrl = getBackendUrl();
    
    // Create request body with either enhanced data or simple prompt
    const requestBody = JSON.stringify({
      newPrompt: prompt,
      modelKey,
      clientProjectId: projectId,
      enhancePrompt,
      // Add enhanced data if it exists
      enhancedData: enhancedData ? {
        projectSummary: enhancedData.projectSummary,
        // Only include checked features
        features: enhancedData.enhancedPrompt
          .filter(item => item.checked)
          .map(item => item.content)
      } : undefined
    });

    console.log(`[API] Request body: ${requestBody}`);
    
    console.log(`[API] Sending generation request for project: ${projectId}`);
    
    // Make API call
    const response = await fetch(`${backendUrl}/generate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      },
      body: requestBody,
    });
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}: ${errorText}`);
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse successful response
    const result = await response.json();
    
    // Validate response
    if (!result.projectId || !result.status) {
      throw new Error('Invalid response from server: Missing projectId or status');
    }
    
    console.log(`[API] Generation started for project: ${projectId}, status: ${result.status}`);
    
    return { 
      projectId: projectId, 
      initialStatus: result.status 
    };
  } catch (error) {
    console.error('[API] Generation error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Send a chat message in an existing project
 * 
 * @param message - User's message
 * @param projectId - Project ID to send message to
 */
export async function sendChatMessage(
  message: string,
  projectId: string
): Promise<{ success: boolean; status?: string }> {
  try {
    // Get authentication token
    const authToken = await getAuthToken();
    
    // Prepare request
    const backendUrl = getBackendUrl();
    const requestBody = JSON.stringify({
      message,
      projectId,
    });
    
    console.log(`[API] Sending chat message for project: ${projectId}`);
    
    // Make API call
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      },
      body: requestBody,
    });
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}: ${errorText}`);
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse successful response
    const result = await response.json();
    
    console.log(`[API] Chat message sent successfully for project: ${projectId}`);
    
    return { 
      success: true,
      status: result.status 
    };
  } catch (error) {
    console.error('[API] Chat error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
} 