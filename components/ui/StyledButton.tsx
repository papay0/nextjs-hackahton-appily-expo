import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withRepeat,
  withDelay,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface StyledButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
  hapticFeedback?: boolean;
  glowEffect?: boolean;
}

export function StyledButton({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  isLoading = false,
  disabled = false,
  hapticFeedback = true,
  glowEffect = true,
}: StyledButtonProps) {
  const scale = useSharedValue(1);
  const pressGlow = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const glowSize = useSharedValue(1);
  const shimmerPosition = useSharedValue(-100);

  useEffect(() => {
    if (glowEffect) {
      glowOpacity.value = withRepeat(
        withTiming(0.8, { 
          duration: 2000, 
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      );
      
      glowSize.value = withRepeat(
        withTiming(1.08, { 
          duration: 2000, 
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      );
      
      // Animate shimmer to sweep across the button
      shimmerPosition.value = withRepeat(
        withDelay(
          1000,
          withTiming(300, { 
            duration: 1500, 
            easing: Easing.inOut(Easing.ease)
          })
        ),
        -1,
        false
      );
    }
  }, [glowEffect, glowOpacity, glowSize, shimmerPosition]);

  const handlePress = () => {
    if (disabled || isLoading) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate button press
    scale.value = withTiming(0.96, { duration: 100 });
    
    // Animate press glow effect
    pressGlow.value = withTiming(1, { duration: 150 });
    
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 200 });
      pressGlow.value = withTiming(0, { duration: 400 });
    }, 100);
    
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowSize.value }],
    };
  });
  
  const pressGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: pressGlow.value * 0.8,
      shadowOpacity: 0.6 + (pressGlow.value * 0.4),
      shadowRadius: 15 + (pressGlow.value * 10),
    };
  });
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shimmerPosition.value },
        { skewX: '-20deg' }
      ],
    };
  });

  // Determine button styling based on variant and size
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : 
    variant === 'secondary' ? styles.secondaryButton : 
    styles.outlineButton,
    size === 'small' ? styles.smallButton : 
    size === 'large' ? styles.largeButton : 
    styles.mediumButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === 'primary' ? styles.primaryButtonText : 
    variant === 'secondary' ? styles.secondaryButtonText : 
    styles.outlineButtonText,
    size === 'small' ? styles.smallButtonText : 
    size === 'large' ? styles.largeButtonText : 
    styles.mediumButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <Animated.View style={styles.buttonContainer}>
      {/* Outer glow layer */}
      {glowEffect && variant === 'primary' && !disabled && (
        <Animated.View 
          style={[
            styles.outerGlow,
            {
              borderRadius: 30,
              position: 'absolute',
              top: -15,
              left: -15,
              right: -15,
              bottom: -15,
              backgroundColor: 'transparent',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 20,
            },
            glowAnimatedStyle
          ]} 
        />
      )}
      
      {/* Inner glow layer */}
      {glowEffect && variant === 'primary' && !disabled && (
        <Animated.View 
          style={[
            styles.innerGlow,
            buttonStyle,
            { 
              backgroundColor: 'transparent',
              position: 'absolute',
              top: -5,
              left: -5,
              right: -5,
              bottom: -5,
              borderWidth: 1,
              borderColor: 'rgba(59, 130, 246, 0.4)',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
            },
            glowAnimatedStyle
          ]} 
        />
      )}
      
      {/* Press reaction glow */}
      {glowEffect && variant === 'primary' && !disabled && (
        <Animated.View 
          style={[
            styles.pressGlow,
            {
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: 35,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: 'rgba(59, 130, 246, 0.5)',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 0 },
            },
            pressGlowStyle
          ]} 
        />
      )}
      
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled || isLoading}
      >
        {/* Shimmer effect */}
        {variant === 'primary' && !disabled && (
          <Animated.View 
            style={[
              styles.shimmer,
              {
                opacity: 0.4,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              shimmerAnimatedStyle
            ]} 
          />
        )}
      
        {isLoading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? '#fff' : '#3B82F6'} 
            size="small" 
          />
        ) : (
          <Text style={buttonTextStyle}>{title}</Text>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
  },
  button: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: '#3B82F6', // Blue
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  largeButton: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    minWidth: 160,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB', // Light gray
    shadowOpacity: 0,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#3B82F6',
  },
  outlineButtonText: {
    color: '#3B82F6',
  },
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  outerGlow: {
    borderRadius: 30,
  },
  innerGlow: {
    borderRadius: 30,
  },
  pressGlow: {
    opacity: 0,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 60,
  },
}); 