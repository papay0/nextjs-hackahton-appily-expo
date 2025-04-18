import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function BlurTabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Blur effect underneath */}
      <BlurView
        tint="dark"
        intensity={40}
        style={StyleSheet.absoluteFill}
      />
      
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
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});
