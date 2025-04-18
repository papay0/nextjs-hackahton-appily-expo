import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function AnimatedInput({
  label,
  error,
  containerStyle,
  value,
  onChangeText,
  secureTextEntry,
  ...restProps
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined;
  
  // Animation for label
  const labelAnimation = useSharedValue(hasValue || isFocused ? 1 : 0);
  
  const onFocus = () => {
    setIsFocused(true);
    labelAnimation.value = withTiming(1, { duration: 150 });
  };
  
  const onBlur = () => {
    setIsFocused(false);
    if (!hasValue) {
      labelAnimation.value = withTiming(0, { duration: 150 });
    }
  };
  
  const labelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            labelAnimation.value,
            [0, 1],
            [0, -25]
          ),
        },
        {
          scale: interpolate(
            labelAnimation.value,
            [0, 1],
            [1, 0.85]
          ),
        },
      ],
      color: interpolate(
        labelAnimation.value,
        [0, 1],
        [0x88, 0x44]
      ) as unknown as string,
    };
  });
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
      
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#A1A1AA"
        {...restProps}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: '100%',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 20,
    fontSize: 16,
    color: '#71717A',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#27272A',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
}); 