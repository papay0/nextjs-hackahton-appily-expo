import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface EnhancementHeaderProps {
  projectSummary: string;
  originalPrompt: string;
  onUpdateSummary?: (summary: string) => void;
}

export function EnhancementHeader({ 
  projectSummary, 
  originalPrompt,
  onUpdateSummary
}: EnhancementHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(projectSummary);

  const handleSave = () => {
    if (onUpdateSummary) {
      onUpdateSummary(editedSummary);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(projectSummary);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Project Summary</Text>
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Ionicons name="close-outline" size={16} color="#94A3B8" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark-outline" size={16} color="#10B981" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <TextInput
              style={styles.summaryInput}
              value={editedSummary}
              onChangeText={setEditedSummary}
              multiline
              autoFocus
              selectionColor="#3B82F6"
            />
          ) : (
            <Text style={styles.summaryText}>{projectSummary}</Text>
          )}
          
          <View style={styles.divider} />
          
          <Text style={styles.promptTitle}>Original Prompt</Text>
          <Text style={styles.promptText}>{originalPrompt}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  summaryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 16,
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
  editActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#94A3B8',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  saveButtonText: {
    color: '#10B981',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
}); 