import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';

// Import components from local paths
import HomePageContainer from '../../components/home/HomePageContainer';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';

export default function HomeScreen() {
  // Sample app data - this could come from a configuration or API later
  const pages = [
    // Page 1
    [
      { id: '1', name: 'Messages', icon: '💬', url: 'https://www.apple.com/messages/' },
      { id: '2', name: 'Photos', icon: '🖼️', url: 'https://www.instagram.com/' },
      { id: '3', name: 'Camera', icon: '📷', url: 'https://www.instagram.com/' },
      { id: '4', name: 'Maps', icon: '🗺️', url: 'https://maps.apple.com/' },
      { id: '5', name: 'Clock', icon: '🕰️', url: 'https://www.apple.com/ios/clock/' },
      { id: '6', name: 'Weather', icon: '☀️', url: 'https://weather.com/' },
      { id: '7', name: 'Notes', icon: '📝', url: 'https://www.apple.com/ios/notes/' },
      { id: '8', name: 'Reminders', icon: '📋', url: 'https://www.apple.com/ios/reminders/' },
      { id: '9', name: 'App Store', icon: '🏪', url: 'https://www.apple.com/app-store/' },
      { id: '10', name: 'Health', icon: '❤️', url: 'https://www.apple.com/ios/health/' },
      { id: '11', name: 'Wallet', icon: '💳', url: 'https://www.apple.com/wallet/' },
      { id: '12', name: 'Settings', icon: '⚙️', url: 'https://support.apple.com/settings' },
    ],
    // Page 2
    [
      { id: '13', name: 'Books', icon: '📚', url: 'https://www.apple.com/apple-books/' },
      { id: '14', name: 'Fitness', icon: '🏃', url: 'https://www.apple.com/fitness/' },
      { id: '15', name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/' },
      { id: '16', name: 'Twitter', icon: '🐦', url: 'https://x.com/home' },
      { id: '17', name: 'Files', icon: '📁', url: 'https://support.apple.com/files' },
      { id: '18', name: 'Home', icon: '🏠', url: 'https://www.apple.com/ios/home/' },
      { id: '19', name: 'Stocks', icon: '📈', url: 'https://www.apple.com/ios/stocks/' },
      { id: '20', name: 'Calculator', icon: '🧮', url: 'https://www.apple.com/ios/calculator/' },
      { id: '21', name: 'Compass', icon: '🧭', url: 'https://www.apple.com/ios/compass/' },
      { id: '22', name: 'Contacts', icon: '👥', url: 'https://www.apple.com/ios/contacts/' },
      { id: '23', name: 'FaceTime', icon: '📹', url: 'https://www.apple.com/facetime/' },
      { id: '24', name: 'Podcasts', icon: '🎙️', url: 'https://www.apple.com/apple-podcasts/' },
    ],
    // Page 3
    [
      { id: '25', name: 'Music', icon: '🎵', url: 'https://www.apple.com/apple-music/' },
      { id: '26', name: 'News', icon: '📰', url: 'https://www.apple.com/news/' },
      { id: '27', name: 'TV', icon: '📺', url: 'https://www.apple.com/apple-tv-plus/' },
      { id: '28', name: 'Voice Memos', icon: '🎤', url: 'https://support.apple.com/voice-memos' },
      { id: '29', name: 'Translate', icon: '🌐', url: 'https://www.apple.com/ios/translate/' },
    ],
  ];

  // Apps for the dock
  const dockApps = [
    { id: 'dock1', name: 'Phone', icon: '📱', url: 'https://www.apple.com/iphone/' },
    { id: 'dock2', name: 'Safari', icon: '🧭', url: 'https://www.apple.com/safari/' },
    { id: 'dock3', name: 'Mail', icon: '✉️', url: 'https://www.apple.com/mail/' },
    { id: 'dock4', name: 'Music', icon: '🎵', url: 'https://www.apple.com/apple-music/' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background animation */}
      <AnimatedBackground particleCount={30} />
      
      {/* Main content with pages, indicator and dock */}
      <HomePageContainer 
        pages={pages} 
        dockApps={dockApps} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
}); 