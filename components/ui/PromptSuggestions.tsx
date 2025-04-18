import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing
} from 'react-native';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS_ROW_1 = [
  "An expense tracker app",
  "A todo list with reminders",
  "A social media app",
  "A fitness tracking app",
  "A recipe sharing platform",
  "A weather app",
  "A note-taking app",
];

const SUGGESTIONS_ROW_2 = [
  "A chat messenger app",
  "A photo sharing app",
  "A habit tracker",
  "A meditation app",
  "A music player",
  "A task management app",
  "A calendar app",
  "A podcast app",
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCROLL_SPEED = 0.015; // Slow animation speed
const PILL_MARGIN = 8; // Margin between pills

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const scrollX1 = useRef(new Animated.Value(0)).current;
  const scrollX2 = useRef(new Animated.Value(-150)).current; // Start offset for row 2
  const scrollViewRef1 = useRef<ScrollView>(null);
  const scrollViewRef2 = useRef<ScrollView>(null);
  const [isUserScrolling1, setIsUserScrolling1] = useState(false);
  const [isUserScrolling2, setIsUserScrolling2] = useState(false);
  const [contentWidth1, setContentWidth1] = useState(0);
  const [contentWidth2, setContentWidth2] = useState(0);
  const animation1 = useRef<Animated.CompositeAnimation | null>(null);
  const animation2 = useRef<Animated.CompositeAnimation | null>(null);

  const createAnimation = (scrollX: Animated.Value, contentWidth: number) => {
    if (contentWidth === 0) return null;
    
    return Animated.loop(
      Animated.timing(scrollX, {
        toValue: -contentWidth / 2,
        duration: (contentWidth / 2) / SCROLL_SPEED,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  };

  useEffect(() => {
    if (!isUserScrolling1 && contentWidth1 > 0) {
      animation1.current = createAnimation(scrollX1, contentWidth1);
      animation1.current?.start();
    }
    
    return () => animation1.current?.stop();
  }, [isUserScrolling1, contentWidth1, scrollX1]);

  useEffect(() => {
    if (!isUserScrolling2 && contentWidth2 > 0) {
      animation2.current = createAnimation(scrollX2, contentWidth2);
      animation2.current?.start();
    }
    
    return () => animation2.current?.stop();
  }, [isUserScrolling2, contentWidth2, scrollX2]);

  const handleScrollBegin = (rowNumber: number) => {
    if (rowNumber === 1) {
      animation1.current?.stop();
      setIsUserScrolling1(true);
    } else {
      animation2.current?.stop();
      setIsUserScrolling2(true);
    }
  };

  const handleScrollEnd = (rowNumber: number) => {
    if (rowNumber === 1) {
      setIsUserScrolling1(false);
    } else {
      setIsUserScrolling2(false);
    }
  };

  const handleContentSizeChange = (width: number, height: number, rowNumber: number) => {
    if (rowNumber === 1) {
      setContentWidth1(width);
    } else {
      setContentWidth2(width);
    }
  };

  const renderSuggestion = (text: string, index: number) => (
    <TouchableOpacity
      key={`${text}-${index}`}
      style={styles.pillContainer}
      onPress={() => onSelectPrompt(text)}
      activeOpacity={0.7}
    >
      <View style={styles.pill}>
        <Text style={styles.pillText} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Duplicate suggestions to create seamless looping effect
  const row1Items = [...SUGGESTIONS_ROW_1, ...SUGGESTIONS_ROW_1, ...SUGGESTIONS_ROW_1];
  const row2Items = [...SUGGESTIONS_ROW_2, ...SUGGESTIONS_ROW_2, ...SUGGESTIONS_ROW_2];

  return (
    <View style={styles.container}>
      {/* First row */}
      <ScrollView
        ref={scrollViewRef1}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => handleScrollBegin(1)}
        onScrollEndDrag={() => handleScrollEnd(1)}
        onMomentumScrollEnd={() => handleScrollEnd(1)}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(width, height) => handleContentSizeChange(width, height, 1)}
      >
        <Animated.View
          style={[
            styles.row,
            { transform: [{ translateX: scrollX1 }] },
          ]}
        >
          {row1Items.map((text, index) => renderSuggestion(text, index))}
        </Animated.View>
      </ScrollView>

      {/* Second row */}
      <ScrollView
        ref={scrollViewRef2}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => handleScrollBegin(2)}
        onScrollEndDrag={() => handleScrollEnd(2)}
        onMomentumScrollEnd={() => handleScrollEnd(2)}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(width, height) => handleContentSizeChange(width, height, 2)}
      >
        <Animated.View
          style={[
            styles.row,
            { transform: [{ translateX: scrollX2 }] },
          ]}
        >
          {row2Items.map((text, index) => renderSuggestion(text, index))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: SCREEN_WIDTH,
    marginTop: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },
  pillContainer: {
    marginHorizontal: PILL_MARGIN,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5f93ff',
  },
  pillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 