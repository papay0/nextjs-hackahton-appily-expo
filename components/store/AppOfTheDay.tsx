import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { StoreAppData } from './mockApps';

export default function AppOfTheDay({ app }: { app: StoreAppData }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: app.bannerUrl }} style={styles.banner} resizeMode="cover" />
      <View style={styles.infoRow}>
        <Image source={{ uri: app.iconUrl }} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{app.name}</Text>
          <Text style={styles.description}>{app.description}</Text>
        </View>
      </View>
      <View style={styles.badge}><Text style={styles.badgeText}>App of the Day</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(59,130,246,0.12)',
    marginBottom: 28,
  },
  banner: {
    width: '100%',
    height: 140,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 14,
  },
  name: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
