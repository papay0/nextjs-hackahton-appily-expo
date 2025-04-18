import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ParticleProps {
  size: number;
  x: number;
  y: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ size, x, y, opacity, duration, delay, color }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Create movement animation
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(moveAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();
    
    // Create fading animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: opacity,
          duration: duration * 0.3,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(fadeAnim, {
          toValue: opacity * 0.5,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: opacity,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    
    // Create subtle pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: duration * 0.5,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: duration * 0.5,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  }, [moveAnim, fadeAnim, scaleAnim, duration, delay, opacity]);
  
  // Calculate random movement path
  const translateY = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [y, y + Math.random() * 60 - 30, y],
  });
  
  const translateX = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [x, x + Math.random() * 60 - 30, x],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: fadeAnim,
          transform: [
            { translateX },
            { translateY },
            { scale: scaleAnim },
          ],
        },
      ]}
    />
  );
};

interface AnimatedBackgroundProps {
  particleCount?: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  particleCount = 15 
}) => {
  // Generate random particles
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    size: Math.random() * 12 + 4, // 4-16px
    x: Math.random() * width,
    y: Math.random() * height,
    opacity: Math.random() * 0.5 + 0.1, // 0.1-0.6
    duration: Math.random() * 8000 + 4000, // 4-12s
    delay: Math.random() * 2000, // 0-2s delay
    color: getRandomColor(),
  }));

  return (
    <View style={styles.container}>
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </View>
  );
};

// Helper function to generate random colors in the blue/purple spectrum
function getRandomColor() {
  const hue = Math.floor(Math.random() * 60) + 200; // 200-260 (blues to purples)
  const saturation = Math.floor(Math.random() * 30) + 60; // 60-90%
  const lightness = Math.floor(Math.random() * 20) + 40; // 40-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
}); 