import React, { ReactNode, useRef, useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BuildContainerProps {
  children: ReactNode;
  style?: any;
  animatedStyle?: any;
}

export function BuildContainer({ children, style, animatedStyle }: BuildContainerProps) {
  // Animation for ambient glow effect
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Subtle animation for the glow effect
  useEffect(() => {
    // Create loop for ambient glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);
  
  // Interpolate glow intensity
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6]
  });
  
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05]
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {/* Border gradient */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      />
      
      {/* Ambient glow effect */}
      <Animated.View 
        style={[
          styles.backgroundGlow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }]
          }
        ]} 
      />
      
      {/* Content area with gradient */}
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.9)']}
        style={styles.contentGradient}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 1, // Border thickness
    position: 'relative',
    overflow: 'hidden',
    // Add shadow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  borderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  contentGradient: {
    borderRadius: 19, // Slightly smaller than container for border effect
    padding: 8,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 100,
    zIndex: 0,
  },
}); 