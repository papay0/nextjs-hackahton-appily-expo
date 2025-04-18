import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  scrollX: Animated.Value;
}

export default function PageIndicator({ totalPages, currentPage }: PageIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }).map((_, index) => {
        return (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentPage 
                  ? '#FFFFFF' 
                  : 'rgba(255, 255, 255, 0.3)',
                opacity: index === currentPage ? 1 : 0.5
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 14,
  },
  dot: {
    height: 7,
    width: 7,
    borderRadius: 3.5,
    marginHorizontal: 4,
  },
}); 