import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnhancedPromptItem } from '@/services/api';

interface FeatureCheckListProps {
  features: EnhancedPromptItem[];
  onToggleFeature: (index: number) => void;
  onAddFeature?: (featureText: string) => void;
}

export function FeatureCheckList({ features, onToggleFeature, onAddFeature }: FeatureCheckListProps) {
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim() && onAddFeature) {
      onAddFeature(newFeature.trim());
      setNewFeature('');
    }
  };

  if (!features || features.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No features available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Features</Text>
      <Text style={styles.description}>
        Select features to include in your app
      </Text>
      
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={`feature-${index}`}
            style={styles.featureItem}
            onPress={() => onToggleFeature(index)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              feature.checked && styles.checkboxChecked
            ]}>
              {feature.checked && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.displayContent}</Text>
              <Text style={styles.featureDescription}>{feature.content}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {onAddFeature && (
        <View style={styles.addFeatureContainer}>
          <TextInput
            style={styles.addFeatureInput}
            value={newFeature}
            onChangeText={setNewFeature}
            placeholder="Add your custom feature..."
            placeholderTextColor="#94A3B8"
            selectionColor="#3B82F6"
            returnKeyType="done"
            onSubmitEditing={handleAddFeature}
          />
          <TouchableOpacity 
            style={[styles.addButton, !newFeature.trim() && styles.addButtonDisabled]} 
            onPress={handleAddFeature}
            disabled={!newFeature.trim()}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  featuresContainer: {
    // Remove maxHeight to allow full expansion
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  addFeatureContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  addFeatureInput: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    height: 48,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    marginRight: 8,
    textAlignVertical: 'center',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
}); 