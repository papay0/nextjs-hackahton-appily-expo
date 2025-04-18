import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppilyHeaderLogoProps {
  size?: number;
}

export const AppilyHeaderLogo: React.FC<AppilyHeaderLogoProps> = ({ 
  size = 28
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.logoText, { fontSize: size }]}>
        <Text style={styles.appPrefix}>app</Text>
        <Text style={styles.ilySuffix}>ily</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
  },
  appPrefix: {
    color: '#3B82F6', // Blue for "app"
  },
  ilySuffix: {
    color: '#FFFFFF', // White for "ily"
  },
}); 