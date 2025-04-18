import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  colors?: string[];
  duration?: number;
  textStyle?: 'normal' | 'bold' | 'title';
}

export function AnimatedGradientText({
  children,
  style,
  colors = ['#3B82F6', '#0EA5E9', '#38BDF8'], // Default blues similar to appily.dev
  duration = 10000,
  textStyle = 'normal',
}: AnimatedGradientTextProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration }),
      -1, // Infinite repetitions
      true // Reverse
    );
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        colors
      ),
    };
  });

  return (
    <Animated.Text
      style={[
        textStyle === 'title' ? styles.title : textStyle === 'bold' ? styles.bold : styles.text,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 