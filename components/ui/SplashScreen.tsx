import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppilyLogo } from './AppilyLogo';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AnimatedGradientText } from './AnimatedGradientText';

export function SplashScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#FFFFFF';
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.logoContainer}>
        <AppilyLogo size={60} color="#FEC237" />
      </View>
      
      <AnimatedGradientText
        textStyle="title"
        style={styles.title}
        colors={['#3B82F6', '#0EA5E9', '#38BDF8']}
      >
        Appily
      </AnimatedGradientText>
      
      <ActivityIndicator 
        size="large" 
        color={colorScheme === 'dark' ? '#3B82F6' : '#0A84FF'} 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
}); 