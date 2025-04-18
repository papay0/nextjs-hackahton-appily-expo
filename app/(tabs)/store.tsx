import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Keyboard, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import AppOfTheDay from '@/components/store/AppOfTheDay';
import MostDownloaded from '@/components/store/MostDownloaded';
import StoreSearchBar from '@/components/store/StoreSearchBar';
import { mockApps, StoreAppData } from '@/components/store/mockApps';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StoreScreen() {
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<{ [id: string]: boolean }>({});
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Pick App of the Day (first app)
  const appOfTheDay = mockApps[0];
  // Sort by downloads for Most Downloaded
  const mostDownloaded = useMemo(() => [...mockApps].sort((a, b) => b.downloads - a.downloads).slice(0, 3), []);
  // Filter for search
  const filteredApps = useMemo(() =>
    mockApps.filter(app =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  // Download simulation handler
  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloaded(prev => ({ ...prev, [id]: true }));
      setDownloadingId(null);
    }, 1200);
  };

  // Handlers for header buttons
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);
  const navigateToProfile = useCallback(() => {
    dismissKeyboard();
    router.push('/profile');
  }, [router, dismissKeyboard]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        {/* Animated Background */}
        <AnimatedBackground particleCount={20} />
        {/* Main Content below header */}
        <View style={{ flex: 1, paddingTop: insets.top, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
          <FlatList
            data={filteredApps}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <View>
                <Text style={styles.title}>Appily Store</Text>
                <Text style={styles.subtitle}>Discover amazing apps created by the community</Text>
                <StoreSearchBar value={search} onChange={setSearch} />
                <AppOfTheDay app={appOfTheDay} />
                <MostDownloaded apps={mostDownloaded} onAppPress={app => handleDownload(app.id)} />
                <Text style={styles.listHeader}>All Apps</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.appRow}
                activeOpacity={0.85}
                onPress={() => router.push(`/store/${item.id}`)}
              >
                <Image source={{ uri: item.iconUrl }} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.appName}>{item.name}</Text>
                  <Text style={styles.appDesc}>{item.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  disabled={!!downloaded[item.id] || downloadingId === item.id}
                  onPress={e => {
                    e.stopPropagation();
                    handleDownload(item.id);
                  }}
                >
                  <Text style={styles.downloadBtnText}>
                    {downloaded[item.id] ? 'Downloaded' : downloadingId === item.id ? 'Downloading...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            style={{ backgroundColor: 'transparent' }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 40,
  },
  listHeader: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 2,
    marginTop: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 14,
  },
  appName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 3,
  },
  appDesc: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  downloadBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginLeft: 10,
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  separator: {
    height: 12,
  },
}); 