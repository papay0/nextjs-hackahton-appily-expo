import { StyleSheet, Text, View, Animated, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ViewStyle, Alert, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { BuildInput } from '@/components/ui/BuildInput';
import { BuildContainer } from '@/components/ui/BuildContainer';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { PromptSuggestions } from '@/components/ui/PromptSuggestions';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import 'react-native-get-random-values'; // This needs to be imported before uuid
import { v4 as uuidv4 } from 'uuid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Memoize child components to prevent unnecessary re-renders
const MemoizedAnimatedBackground = React.memo(AnimatedBackground);
const MemoizedBuildContainer = React.memo(BuildContainer);
const MemoizedBuildInput = React.memo(BuildInput);
const MemoizedCustomHeader = React.memo(CustomHeader);

export default function BuildScreen() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation values - these won't change between renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Run animation only once when component mounts
  useEffect(() => {
    // Animate elements in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (model: string) => {
    if (!prompt.trim() || isSubmitting) return;
    
    // Force keyboard dismissal at the screen level
    Keyboard.dismiss();
    
    try {
      setIsSubmitting(true);
      
      // Generate a unique project ID
      const projectId = uuidv4();
      console.log('Starting generation with projectId:', projectId);
      
      // Navigate to prompt enhancement screen instead of build details
      router.navigate({
        pathname: "/(build)/prompt-enhancement",
        params: {
          projectId,
          prompt: prompt.trim(), // Pass prompt as parameter
          model: model // Pass selected model as parameter
        }
      });
      
      // Clear the prompt input
      setPrompt('');
      
    } catch (error) {
      console.error('Error during navigation:', error);
      
      // Show error to user
      Alert.alert(
        'Navigation Error',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, router, isSubmitting]);

  // Memoize the animation styles
  const titleAnimationStyle = useMemo(() => ({
    opacity: fadeAnim, 
    transform: [{ scale: scaleAnim }]
  }), [fadeAnim, scaleAnim]);

  // Memoize the input animation style
  const inputAnimationStyle = useMemo(() => ({ 
    width: '100%',
    opacity: fadeAnim, 
    transform: [{ scale: scaleAnim }] 
  } as Animated.AnimatedProps<ViewStyle>), [fadeAnim, scaleAnim]);

  // Memoize the text change handler
  const handleTextChange = useCallback((text: string) => {
    setPrompt(text);
  }, []);

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const navigateToProfile = useCallback(() => {
    dismissKeyboard();
    router.push('/profile');
  }, [router, dismissKeyboard]);

  // Add handler for prompt suggestions
  const handlePromptSelect = useCallback((selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  }, []);

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.outerContainer}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
          >
            <View style={styles.container}>
              
              {/* Custom Header */}
              <MemoizedCustomHeader 
                transparent={true}
                onAvatarPress={navigateToProfile}
                showHistoryButton={true}
                onHistoryPress={() => {
                  dismissKeyboard();
                  router.navigate("/(projects)/history");
                }}
              />
              
              {/* Background elements */}
              <MemoizedAnimatedBackground particleCount={30} />
              
              <View 
                style={[
                  styles.content, 
                  { paddingBottom: insets.bottom + 90 }
                ]}
              >
                {/* Title and description */}
                <Animated.View 
                  style={[
                    styles.titleContainer,
                    titleAnimationStyle
                  ]}
                >
                  <Text style={styles.title}>
                    What do you want to build?
                  </Text>
                  <Text style={styles.description}>
                    Prompt, run, edit, and deploy your mobile web app.
                  </Text>
                </Animated.View>

                {/* Input area */}
                <Animated.View style={inputAnimationStyle}>
                  <MemoizedBuildContainer>
                    <MemoizedBuildInput 
                      value={prompt} 
                      onChangeText={handleTextChange}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </MemoizedBuildContainer>
                </Animated.View>
                
                {/* Prompt Suggestions - now placed AFTER the input */}
                <Animated.View style={[
                  inputAnimationStyle, 
                  { 
                    width: SCREEN_WIDTH, 
                    marginHorizontal: -24, // Counteract parent padding
                    marginTop: 20 
                  }
                ]}>
                  <PromptSuggestions onSelectPrompt={handlePromptSelect} />
                </Animated.View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark blue background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3B82F6', // Blue text
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
