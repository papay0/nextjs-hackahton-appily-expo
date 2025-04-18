import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define the Log interface
interface Log {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: Date | string;
}

// Convert logs array to match Log interface if needed
const formatLogs = (logs: string[]): Log[] => {
  return logs.map((log, index) => {
    // Try to parse log message if it's JSON
    try {
      const parsedLog = JSON.parse(log);
      return {
        id: parsedLog.id || `log-${index}`,
        type: parsedLog.type || parsedLog.level || 'info',
        message: parsedLog.message || log,
        timestamp: parsedLog.timestamp ? new Date(parsedLog.timestamp) : new Date()
      };
    } catch {
      // Not JSON, check if it's already a formatted log message with level prefix
      const levelMatch = log.match(/^\[(info|error|warning|success|debug)\]/i);
      if (levelMatch) {
        const level = levelMatch[1].toLowerCase();
        const message = log.replace(/^\[(info|error|warning|success|debug)\]\s*/i, '').trim();
        return {
          id: `log-${index}`,
          type: level as Log['type'],
          message: message,
          timestamp: new Date()
        };
      }
      
      // Fallback for plain text log
      return {
        id: `log-${index}`,
        type: 'info',
        message: log,
        timestamp: new Date()
      };
    }
  });
};

// Individual log item component
const LogItem = ({ log }: { log: Log }) => {
  const getTypeColor = () => {
    switch (log.type) {
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'info':
        return '#3B82F6';
      default:
        return '#94A3B8';
    }
  };

  const typeColor = getTypeColor();
  const timestamp = typeof log.timestamp === 'string' 
    ? log.timestamp 
    : log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        <View style={[styles.logTypeBadge, { backgroundColor: `${typeColor}20` }]}>
          <Text style={[styles.logType, { color: typeColor }]}>
            {log.type.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.logMessage}>{log.message}</Text>
    </View>
  );
};

interface LiveLogsTabProps {
  projectId: string;
  logs?: string[];
  loading?: boolean;
  error?: Error | null;
}

export default function LiveLogsTab({ 
  projectId, 
  logs = [], 
  loading = false, 
  error = null 
}: LiveLogsTabProps) {
  const flatListRef = useRef<FlatList>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const formattedLogs = formatLogs(logs);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && flatListRef.current && logs.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [logs.length, autoScroll]);

  if (loading && logs.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text style={styles.errorText}>Error loading logs: {error.message}</Text>
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="terminal-outline" size={64} color="rgba(59, 130, 246, 0.3)" />
        <Text style={styles.emptyTitle}>No Logs Yet</Text>
        <Text style={styles.emptyText}>Live logs will appear here as your build runs</Text>
        <Text style={styles.projectId}>Project ID: {projectId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live Logs</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.autoScrollButton}
          onPress={() => setAutoScroll(!autoScroll)}
        >
          <Ionicons 
            name={autoScroll ? "arrow-down-circle" : "arrow-down-circle-outline"} 
            size={16} 
            color={autoScroll ? "#3B82F6" : "#94A3B8"}
          />
          <Text style={[
            styles.autoScrollText,
            { color: autoScroll ? "#3B82F6" : "#94A3B8" }
          ]}>
            Auto-scroll
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={formattedLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogItem log={item} />}
        contentContainerStyle={styles.contentContainer}
        onScroll={(event) => {
          // Detect if user has scrolled up manually
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const isAtBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 20;
          if (!isAtBottom && autoScroll) {
            setAutoScroll(false);
          }
        }}
        onEndReached={() => {
          // Re-enable auto-scroll if user scrolls to bottom
          if (!autoScroll) {
            setAutoScroll(true);
          }
        }}
        onEndReachedThreshold={0.1}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  autoScrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  autoScrollText: {
    fontSize: 12,
    marginLeft: 4,
  },
  contentContainer: {
    padding: 12,
  },
  logItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  logTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logType: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logMessage: {
    fontSize: 14,
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
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