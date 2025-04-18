import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { StoreAppData } from './mockApps';

export default function MostDownloaded({ apps, onAppPress }: { apps: StoreAppData[], onAppPress: (app: StoreAppData) => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Most Downloaded</Text>
      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.appCard}>
            <Image source={{ uri: item.iconUrl }} style={styles.icon} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.downloads}>{item.downloads.toLocaleString()} downloads</Text>
            <Text style={styles.downloadBtn} onPress={() => onAppPress(item)}>Download</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 2,
  },
  appCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    width: 130,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  downloads: {
    color: '#60a5fa',
    fontSize: 12,
    marginBottom: 8,
  },
  downloadBtn: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 13,
  },
});
