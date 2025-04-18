import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EnhanceToggleProps {
  value: boolean;
  onToggle: () => void;
}

export function EnhanceToggle({ value, onToggle }: EnhanceToggleProps) {
  return (
    <TouchableOpacity 
      style={[styles.enhanceButton, value && styles.enhanceButtonActive]} 
      onPress={onToggle}
    >
      <Ionicons 
        name="flash" 
        size={16} 
        color={value ? "#FFFFFF" : "#666666"} 
      />
      <Text style={[styles.enhanceText, value && styles.enhanceTextActive]}>
        Enhance
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  enhanceButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  enhanceText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  enhanceTextActive: {
    color: '#FFFFFF',
  },
}); 