import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlowProps {
  size: number;
  color: string;
  position: { x: number; y: number };
  opacity: number;
  duration: number;
  delay: number;
  blur?: number;
}

const GlowCircle = ({
  size,
  color,
  position,
  opacity,
  duration,
  delay,
  blur = 40,
}: GlowProps) => {
  const scale = useSharedValue(1);
  const opacityAnim = useSharedValue(opacity);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    opacityAnim.value = withDelay(
      delay,
      withRepeat(
        withTiming(opacity * 1.2, {
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, [delay, duration, opacity, opacityAnim, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.glow,
        {
          width: size,
          height: size,
          left: position.x * SCREEN_WIDTH - size / 2,
          top: position.y * SCREEN_HEIGHT - size / 2,
          backgroundColor: color,
          opacity,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: blur,
        },
        animatedStyle,
      ]}
    />
  );
};

interface GlowEffectsProps {
  intensity?: number;
}

export function GlowEffects({ intensity = 1 }: GlowEffectsProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Distributed subtle glows */}
      <GlowCircle
        size={180}
        color="rgba(59, 130, 246, 0.2)"
        position={{ x: 0.5, y: 0.1 }}
        opacity={0.15 * intensity}
        duration={8000}
        delay={0}
        blur={80}
      />
      
      <GlowCircle
        size={120}
        color="rgba(14, 165, 233, 0.15)"
        position={{ x: 0.2, y: 0.3 }}
        opacity={0.1 * intensity}
        duration={10000}
        delay={2000}
        blur={60}
      />
      
      <GlowCircle
        size={150}
        color="rgba(99, 102, 241, 0.1)"
        position={{ x: 0.8, y: 0.35 }}
        opacity={0.15 * intensity}
        duration={12000}
        delay={1000}
        blur={70}
      />
      
      <GlowCircle
        size={100}
        color="rgba(59, 130, 246, 0.2)"
        position={{ x: 0.3, y: 0.7 }}
        opacity={0.1 * intensity}
        duration={9000}
        delay={500}
        blur={50}
      />
      
      <GlowCircle
        size={90}
        color="rgba(14, 165, 233, 0.15)"
        position={{ x: 0.7, y: 0.8 }}
        opacity={0.12 * intensity}
        duration={11000}
        delay={1500}
        blur={55}
      />
      
      <GlowCircle
        size={70}
        color="rgba(99, 102, 241, 0.1)"
        position={{ x: 0.85, y: 0.15 }}
        opacity={0.1 * intensity}
        duration={9500}
        delay={800}
        blur={40}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
}); 