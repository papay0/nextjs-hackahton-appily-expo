import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResultData } from '@/hooks/useSharedProjectData';

interface PreviewTabProps {
  projectId: string;
  resultData?: ResultData | null;
  loading?: boolean;
  error?: Error | null;
}

export default function PreviewTab({
  projectId,
  resultData = null,
  loading = false,
  error = null
}: PreviewTabProps) {
  const insets = useSafeAreaInsets();
  const deployUrl = resultData?.deployUrl;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Preparing preview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text style={styles.errorText}>Error loading preview: {error.message}</Text>
      </View>
    );
  }

  if (!deployUrl) {
    return (
      <View style={styles.centered}>
        <Ionicons name="globe-outline" size={64} color="rgba(59, 130, 246, 0.3)" />
        <Text style={styles.emptyTitle}>No Preview Available</Text>
        <Text style={styles.emptyText}>Your app preview will appear here once deployment is complete</Text>
        <Text style={styles.projectId}>Project ID: {projectId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.webViewContainer, { paddingBottom: insets.bottom }]}>
        <WebView
          source={{ uri: deployUrl }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 12,
  },
  urlIcon: {
    marginRight: 8,
  },
  urlText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
  },
  projectId: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.7)',
    marginTop: 16,
  },
}); 