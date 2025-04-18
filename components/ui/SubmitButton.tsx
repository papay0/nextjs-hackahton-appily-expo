import React from 'react';
import { TouchableOpacity, StyleSheet, View, Keyboard, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SubmitButtonProps {
  onPress: () => void;
  disabled?: boolean;
  animate?: boolean;
  isLoading?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  onPress, 
  disabled = false,
  animate = false,
  isLoading = false
}) => {
  const handlePress = () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();
    
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call the onPress callback
    onPress();
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[
          styles.submitButton,
          disabled && styles.disabledButton,
          isLoading && styles.loadingButton
        ]} 
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>↑</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Very high to ensure it's above everything
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Add slight shadow
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  loadingButton: {
    backgroundColor: '#0A84FF',
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }
}); 