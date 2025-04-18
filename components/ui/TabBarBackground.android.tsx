import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Semi-transparent background */}
      <View style={[StyleSheet.absoluteFill, styles.background]} />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.5)', 'rgba(15, 23, 42, 0.8)']}
        style={[StyleSheet.absoluteFill, styles.gradient]}
      />
      
      {/* Top border with glow effect */}
      <View style={styles.topBorder} />
    </View>
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  gradient: {
    // Already using absoluteFill
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    elevation: 2,
  }
}); 