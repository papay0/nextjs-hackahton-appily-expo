import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import React, { useRef, useEffect } from 'react';

export function HapticTab({ 
  accessibilityState, 
  onPressIn,
  children,
  ...rest
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected;
  
  // Use React Native's Animated instead of Reanimated
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const opacityAnim = useRef(new RNAnimated.Value(focused ? 1 : 0.7)).current;
  const indicatorOpacity = useRef(new RNAnimated.Value(focused ? 1 : 0)).current;
  const indicatorScale = useRef(new RNAnimated.Value(focused ? 1 : 0)).current;
  
  // Update animations when focused state changes
  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(indicatorOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(indicatorScale, {
        toValue: focused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim, indicatorOpacity, indicatorScale]);

  const handlePressIn = (ev: any) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn?.(ev);
  };

  return (
    <View style={styles.tabButton}>
      <PlatformPressable
        {...rest}
        accessibilityState={accessibilityState}
        onPressIn={handlePressIn}
        style={[rest.style, styles.pressable]}
      >
        <RNAnimated.View 
          style={[
            styles.iconContainer, 
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim
            }
          ]}
        >
          {children}
          
          <RNAnimated.View 
            style={[
              styles.activeIndicator, 
              {
                opacity: indicatorOpacity,
                transform: [{ scaleX: indicatorScale }]
              }
            ]} 
          />
        </RNAnimated.View>
      </PlatformPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 20,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  }
});
