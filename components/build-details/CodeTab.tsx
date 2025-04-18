import React, { useRef, useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CodeFile } from '@/hooks/useSharedProjectData';
import { StreamingCodeFile } from './StreamingCodeFile';

interface CodeTabProps {
  projectId: string;
  codeFiles?: CodeFile[];
  loading?: boolean;
  error?: Error | null;
}

export default function CodeTab({ 
  projectId, 
  codeFiles = [], 
  loading = false, 
  error = null 
}: CodeTabProps) {
  const flatListRef = useRef<FlatList>(null);
  const [showButton, setShowButton] = useState(false);
  const userHasScrolled = useRef(false);
  const lastContentLength = useRef(0);
  const isUserScrolling = useRef(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minimumScrollDistance = 300; // Minimum pixels to scroll before showing button
  const buttonVisibilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScrolling = useRef(false);
  
  // Check if there's actively streaming content
  const hasStreamingContent = useMemo(() => {
    return codeFiles.some(file => file.status === 'streaming');
  }, [codeFiles]);

  // Only sort once when codeFiles change, not on every render
  const sortedFiles = useMemo(() => {
    return [...codeFiles].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });
  }, [codeFiles]);

  // Update the auto-scroll effect to mark programmatic scrolling
  useEffect(() => {
    if (flatListRef.current && sortedFiles.length > 0) {
      // Calculate total content length
      let totalLength = 0;
      sortedFiles.forEach(file => {
        totalLength += file.content.length;
      });
      
      // Only auto-scroll if content length increased and user hasn't manually scrolled
      // or if there's streaming content (force scroll)
      if ((totalLength > lastContentLength.current && !userHasScrolled.current) || 
          (hasStreamingContent && !userHasScrolled.current)) {
        
        // Set the flag before scrolling
        isProgrammaticScrolling.current = true;
        
        // Short delay to ensure rendering is complete
        setTimeout(() => {
          if (flatListRef.current) {
            // Use animated scrolling for a smoother experience
            flatListRef.current.scrollToEnd({ animated: true });
            
            // Reset the flag after animation completes (approx 400ms)
            setTimeout(() => {
              isProgrammaticScrolling.current = false;
            }, 400);
          }
        }, 100);
      }
      
      // Update the last content length
      lastContentLength.current = totalLength;
    }
  }, [sortedFiles, hasStreamingContent]);

  // Update the handleUserScroll function to ignore programmatic scrolls
  const handleUserScroll = ({ nativeEvent }: { nativeEvent: { contentOffset: { y: number }, layoutMeasurement: { height: number }, contentSize: { height: number } } }) => {
    // Ignore scroll events triggered by our own auto-scrolling
    if (isProgrammaticScrolling.current) {
      return;
    }
    
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const isNearBottom = distanceFromBottom < 100;
    
    // Track if user has scrolled a significant amount (prevent accidental triggers)
    const hasScrolledSignificantly = contentOffset.y > minimumScrollDistance;
    
    // As soon as any scroll happens, consider it user scrolling
    if (!isUserScrolling.current) {
      isUserScrolling.current = true;
      userHasScrolled.current = true;
    }
    
    // Clear any existing scroll timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    // Set a timer to detect when scrolling stops
    scrollTimerRef.current = setTimeout(() => {
      isUserScrolling.current = false;
      
      // Only reset the user scroll flag if they're at the bottom
      if (isNearBottom) {
        userHasScrolled.current = false;
        
        // Always hide the button when at the bottom
        if (showButton) {
          setShowButton(false);
        }
      }
    }, 300);
    
    // Handle button visibility with more stability
    if (!isNearBottom && hasStreamingContent) {
      // Only show button if the user has scrolled a significant amount
      if (hasScrolledSignificantly && !showButton) {
        // Clear any existing timer for button visibility
        if (buttonVisibilityTimerRef.current) {
          clearTimeout(buttonVisibilityTimerRef.current);
        }
        
        // Add a small delay before showing the button to prevent flashing
        buttonVisibilityTimerRef.current = setTimeout(() => {
          setShowButton(true);
        }, 500); // Half-second delay before showing button
      }
    } else if (isNearBottom && showButton) {
      // Clear any pending button show timers
      if (buttonVisibilityTimerRef.current) {
        clearTimeout(buttonVisibilityTimerRef.current);
        buttonVisibilityTimerRef.current = null;
      }
      
      // Immediately hide the button when back at bottom
      setShowButton(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading code files...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading code files</Text>
      </View>
    );
  }

  if (sortedFiles.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="code-outline" size={64} color="rgba(59, 130, 246, 0.3)" />
        <Text style={styles.emptyTitle}>No Code Files Yet</Text>
        <Text style={styles.emptyText}>Generated code will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedFiles}
        initialNumToRender={10}
        
        renderItem={({ item }) => (
          <StreamingCodeFile key={item.id} file={item} />
        )}
        
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        ListFooterComponent={<View style={{ height: 80 }} />}
        
        // Track user scrolling with more reliable detection
        onScroll={handleUserScroll}
        
        // Higher throttle for performance, still responsive
        scrollEventThrottle={100}
        
        // Update the onContentSizeChange handler to mark programmatic scrolling
        onContentSizeChange={() => {
          if (hasStreamingContent && !userHasScrolled.current) {
            // Set the flag before scrolling
            isProgrammaticScrolling.current = true;
            
            // Use animated scrolling for a smoother experience
            flatListRef.current?.scrollToEnd({ animated: true });
            
            // Reset the flag after animation completes
            setTimeout(() => {
              isProgrammaticScrolling.current = false;
            }, 400);
          }
        }}
      />
      
      {showButton && (
        <TouchableOpacity 
          style={styles.scrollButton}
          onPress={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            userHasScrolled.current = false;
            setShowButton(false);
          }}
        >
          <Ionicons name="arrow-down" size={16} color="#FFF" />
          <Text style={styles.buttonText}>See latest</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    // Allow content to flow into safe area
    paddingBottom: 0,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  scrollButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});