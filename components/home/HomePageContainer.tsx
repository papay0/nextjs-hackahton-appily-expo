import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppData } from './AppGrid';
import AppGrid from './AppGrid';
import PageIndicator from './PageIndicator';
import AppDock from './AppDock';

interface HomePageContainerProps {
  pages: AppData[][];
  dockApps: AppData[];
  onAppPress?: (app: AppData) => void;
}

const { width } = Dimensions.get('window');

export default function HomePageContainer({ pages, dockApps, onAppPress }: HomePageContainerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
  // Update current page when scrolling stops
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      {/* Scrollable app pages */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          // Update scrollX manually
          const offsetX = event.nativeEvent.contentOffset.x;
          scrollX.setValue(offsetX);
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {pages.map((pageApps, index) => (
          <View 
            key={`page-${index}`} 
            style={[
              styles.page,
              { 
                paddingTop: insets.top + 20 // Add padding for top safe area
              }
            ]}
          >
            <AppGrid apps={pageApps} onAppPress={onAppPress} />
          </View>
        ))}
      </ScrollView>
      
      {/* Page indicator dots */}
      <PageIndicator
        totalPages={pages.length}
        currentPage={currentPage}
        scrollX={scrollX}
      />
      
      {/* Dock */}
      <AppDock apps={dockApps} onAppPress={onAppPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    width,
    flex: 1,
  },
}); 