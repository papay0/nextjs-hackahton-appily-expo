import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollViewProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CodeFile } from '@/hooks/useSharedProjectData';
import CodeHighlighter from 'react-native-code-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface StreamingCodeFileProps {
  file: CodeFile;
}

// Max number of characters to show in a single rendering pass
const MAX_CONTENT_LENGTH = 10000;

// Split code into smaller chunks for more efficient rendering
const CHUNK_SIZE = 2000; // Reduced chunk size for better performance
const MAX_VISIBLE_CHUNKS = 5; // Reduced max chunks for better initial render

export const StreamingCodeFile = React.memo(({ file }: StreamingCodeFileProps) => {
  const fadeAnim = useRef(new Animated.Value(0.7)).current;
  const prevContentRef = useRef(file.content);
  const [visibleContent, setVisibleContent] = useState(file.content);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Memoize the language determination
  const language = useMemo(() => {
    return getLanguageFromPath(file.path || '');
  }, [file.path]);
  
  // Memoize the custom style
  const customStyle = useMemo(() => ({
    ...atomOneDark,
    hljs: {
      ...atomOneDark.hljs,
      background: '#1A202C',
      color: '#E2E8F0'
    }
  }), []);
  
  // Fading animation for new files
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  // Streaming effect - update content as it arrives
  useEffect(() => {
    if (file.status === 'streaming' && file.content !== prevContentRef.current) {
      // Only update if there's new content to avoid unnecessary renders
      if (file.content.length > prevContentRef.current.length) {
        setVisibleContent(file.content);
        prevContentRef.current = file.content;
      }
    } else if (file.status === 'complete' && file.content !== visibleContent) {
      // If complete, show all content
      setVisibleContent(file.content);
      prevContentRef.current = file.content;
    }
  }, [file.content, file.status, visibleContent]);
  
  // Split content into chunks for more efficient rendering
  const contentChunks = useMemo(() => {
    // Fast path - return empty array if no content
    if (!visibleContent) return ['// Loading...'];
    
    const chunks = [];
    const content = visibleContent;
    const totalChunks = Math.ceil(content.length / CHUNK_SIZE);
    
    // Determine how many chunks to actually render
    const chunksToRender = isExpanded 
      ? totalChunks 
      : Math.min(MAX_VISIBLE_CHUNKS, totalChunks);
    
    for (let i = 0; i < chunksToRender; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, content.length);
      chunks.push(content.substring(start, end));
    }
    
    // Add ellipsis if content is truncated
    if (!isExpanded && totalChunks > MAX_VISIBLE_CHUNKS) {
      chunks.push('\n\n... (tap to show more)');
    }
    
    return chunks;
  }, [visibleContent, isExpanded]);
  
  // Join chunks for display, but only what we need to show
  const displayContent = useMemo(() => {
    return contentChunks.join('');
  }, [contentChunks]);
  
  // Use useCallback for event handlers
  const handleExpandPress = useCallback(() => {
    setIsExpanded(true);
  }, []);
  
  // Get language from file extension
  function getLanguageFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'css': 'css',
      'json': 'json',
      'html': 'html',
      'md': 'markdown',
      'py': 'python',
      'rb': 'ruby',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'sh': 'bash',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'graphql': 'graphql',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    };
    return langMap[extension] || 'javascript';
  }
  
  // Prepare scroll view props with proper typing
  const scrollViewProps = useMemo(() => {
    const props: ScrollViewProps & { 
      removeClippedSubviews?: boolean;
      nestedScrollEnabled?: boolean;
    } = {
      showsVerticalScrollIndicator: true,
      contentContainerStyle: styles.codeScrollContent,
      style: styles.codeScrollView,
      removeClippedSubviews: true,
      scrollEnabled: true,
      nestedScrollEnabled: true,
    };
    
    return props;
  }, []);
  
  // Memoize the expand button component
  const ExpandButton = useMemo(() => {
    if (isExpanded || visibleContent.length <= MAX_CONTENT_LENGTH) {
      return null;
    }
    
    return (
      <TouchableOpacity 
        style={styles.expandButton} 
        onPress={handleExpandPress}
        activeOpacity={0.7}
      >
        <Text style={styles.expandButtonText}>Show More</Text>
      </TouchableOpacity>
    );
  }, [isExpanded, visibleContent.length, handleExpandPress]);
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={18} color="#63B3ED" style={styles.icon} />
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {file.path}
        </Text>
        
        {file.status === 'streaming' && (
          <View style={styles.streamingIndicator}>
            <View style={styles.streamingDot} />
            <Text style={styles.streamingText}>Streaming</Text>
          </View>
        )}
      </View>
      
      <View style={styles.codeContent}>
        <CodeHighlighter
          hljsStyle={customStyle}
          language={language}
          textStyle={styles.codeText}
          scrollViewProps={scrollViewProps}
        >
          {displayContent}
        </CodeHighlighter>
        {ExpandButton}
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Custom equality function to prevent unnecessary re-renders
  return (
    prevProps.file.id === nextProps.file.id &&
    prevProps.file.content === nextProps.file.content &&
    prevProps.file.status === nextProps.file.status
  );
});

// Add display name
StreamingCodeFile.displayName = 'StreamingCodeFile';

// Optimize styles by creating them outside the component
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  icon: {
    marginRight: 8,
  },
  fileName: {
    color: '#E2E8F0',
    fontFamily: 'Menlo',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48BB78',
    marginRight: 6,
  },
  streamingText: {
    color: '#48BB78',
    fontSize: 12,
    fontWeight: '500',
  },
  codeContent: {
    padding: 0,
    backgroundColor: '#1A202C',
  },
  codeScrollView: {
    backgroundColor: '#1A202C',
  },
  codeScrollContent: {
    backgroundColor: '#1A202C',
    minWidth: '100%',
    padding: 12,
  },
  codeText: {
    fontFamily: 'Menlo',
    fontSize: 14,
    lineHeight: 20,
    color: '#E2E8F0',
  },
  expandButton: {
    backgroundColor: '#2D3748',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  expandButtonText: {
    color: '#63B3ED',
    fontWeight: '600',
  },
}); 