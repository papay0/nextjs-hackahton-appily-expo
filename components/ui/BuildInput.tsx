import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, View, Text, Pressable, Keyboard, NativeSyntheticEvent, TextInputSubmitEditingEventData, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SubmitButton } from '../ui/SubmitButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Define available AI models
export type AIModel = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const AI_MODELS: AIModel[] = [
  { id: 'anthropic/claude-3.7-sonnet', name: 'Anthropic Sonnet 3.7', icon: 'sparkles-outline' },
  { id: 'openai/gpt-4.1', name: 'OpenAI GPT 4.1', icon: 'logo-electron' },
  { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro', icon: 'diamond-outline' }
];

interface BuildInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (model: string) => void;
  isSubmitting?: boolean;
  initialModel?: string;
}

export const BuildInput: React.FC<BuildInputProps> = ({ 
  value, 
  onChangeText,
  onSubmit,
  isSubmitting = false,
  initialModel = 'anthropic/claude-3.7-sonnet',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [isModelSelectorVisible, setIsModelSelectorVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Close keyboard when component unmounts
  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);
  
  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => setIsFocused(false);
  
  // Focus the input when tapping anywhere in the container
  const handlePress = () => {
    if (inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  };
  
  // Handle the submit action with keyboard dismissal
  const handleSubmit = () => {
    if (isSubmitting) return;
    
    // First ensure input loses focus
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Then dismiss keyboard directly
    Keyboard.dismiss();
    
    // Then call the provided onSubmit function with the selected model
    setTimeout(() => {
      onSubmit(selectedModel);
    }, 100);
  };
  
  // Handle the return key press
  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (value.trim() && !isSubmitting) {
      handleSubmit();
    }
  };

  // Select a model and close the selector
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelSelectorVisible(false);
  };

  // Get the currently selected model object
  const getSelectedModel = () => {
    return AI_MODELS.find(model => model.id === selectedModel) || AI_MODELS[0];
  };
  
  return (
    <View style={styles.container}>
      {/* Text Input Container */}
      <Pressable 
        style={styles.textInputWrapper} 
        onPress={handlePress}
        disabled={isSubmitting}
        // Add "feedback" so users know it's touchable
        android_ripple={{ color: 'rgba(59, 130, 246, 0.2)' }}
      >
        {/* Simple background with subtle gradient */}
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputBackground}
        />
        
        {/* Border highlight when focused */}
        {isFocused && <View style={styles.focusBorder} />}
        
        {/* Simple placeholder only shown when empty */}
        {!value && !isSubmitting && (
          <Text style={styles.placeholder}>
            Describe your app idea...
          </Text>
        )}
        
        {/* Submitting state indicator */}
        {isSubmitting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Starting generation...</Text>
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          multiline
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          selectionColor="rgba(59, 130, 246, 0.7)"
          placeholder=""
          blurOnSubmit={true}
          editable={!isSubmitting}
        />
        
        {/* Wrap SubmitButton in a View with proper zIndex to ensure it's tappable */}
        <View style={styles.submitButtonWrapper}>
          <SubmitButton 
            onPress={handleSubmit} 
            disabled={!value.trim() || isSubmitting}
            animate={true}
            isLoading={isSubmitting}
          />
        </View>
      </Pressable>

      {/* Model Selector */}
      <View style={styles.modelSelectorContainer}>
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modelSelectorBackground}
        />
        
        {/* Divider line for visual separation */}
        <View style={styles.divider} />
        
        <View style={styles.modelLabelContainer}>
          <Ionicons 
            name="flash-outline" 
            size={14} 
            color="rgba(148, 163, 184, 0.9)" 
          />
          <Text style={styles.modelLabel}>AI Model:</Text>
          
          {/* Dropdown Selector */}
          <TouchableOpacity 
            style={styles.modelDropdown}
            onPress={() => !isSubmitting && setIsModelSelectorVisible(true)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons
              name={getSelectedModel().icon}
              size={14}
              color="#3B82F6"
            />
            <Text style={styles.selectedModelText}>
              {getSelectedModel().name}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color="rgba(148, 163, 184, 0.9)"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Model Selection Modal */}
      <Modal
        visible={isModelSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModelSelectorVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsModelSelectorVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select AI Model</Text>
            {AI_MODELS.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  selectedModel === model.id && styles.selectedModelOption
                ]}
                onPress={() => handleModelSelect(model.id)}
              >
                <View style={styles.modelIconContainer}>
                  <Ionicons
                    name={model.icon}
                    size={20}
                    color={selectedModel === model.id ? '#3B82F6' : 'rgba(148, 163, 184, 0.8)'}
                  />
                </View>
                <View style={styles.modelInfo}>
                  <Text style={[
                    styles.modelName,
                    selectedModel === model.id && styles.selectedModelName
                  ]}>
                    {model.name}
                  </Text>
                </View>
                {selectedModel === model.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={18} color="#3B82F6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textInputWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    minHeight: 100, // Ensure there's a minimum height for better touch target
  },
  inputBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  textInput: {
    minHeight: 100,
    width: '100%', // Ensure it takes full width
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    paddingTop: 16,
    paddingBottom: 16,
    paddingRight: 60, // Make room for the submit button
    paddingLeft: 16,
    backgroundColor: 'transparent',
    lineHeight: 24,
    letterSpacing: 0.2,
    zIndex: 2, // Ensure the TextInput is on top for touch events
  },
  placeholder: {
    position: 'absolute',
    top: 16,
    left: 16,
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 16,
    fontWeight: '400',
    zIndex: 1,
    pointerEvents: 'none', // Make sure placeholder doesn't intercept touches
  },
  loadingContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  loadingText: {
    marginLeft: 8,
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 16,
    fontWeight: '400',
  },
  focusBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.6)', 
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 0,
  },
  submitButtonWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    padding: 16,
    zIndex: 3, // Ensure SubmitButton is on top for touch events
  },
  modelSelectorContainer: {
    position: 'relative',
    width: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modelSelectorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  divider: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  modelLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelLabel: {
    color: 'rgba(148, 163, 184, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 10,
  },
  modelDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  selectedModelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  selectedModelOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  modelIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedModelName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 8,
  },
}); 