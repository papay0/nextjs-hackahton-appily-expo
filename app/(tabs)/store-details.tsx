import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockApps } from '@/components/store/mockApps';
import { Ionicons } from '@expo/vector-icons';

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find the app by id
  const app = mockApps.find(a => a.id === id);
  if (!app) {
    return (
      <View style={styles.centered}><Text>App not found.</Text></View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{app.name}</Text>
      </View>
      {/* App image */}
      <Image source={{ uri: app.iconUrl }} style={styles.image} />
      {/* Name & rating */}
      <Text style={styles.appName}>{app.name}</Text>
      <View style={styles.row}>
        <Ionicons name="star" size={18} color="#FFD700" />
        <Text style={styles.rating}>{app.rating ? app.rating.toFixed(1) : '4.8'}</Text>
        <Text style={styles.downloads}>{app.downloads.toLocaleString()} downloads</Text>
      </View>
      {/* Description */}
      <Text style={styles.description}>{app.description}</Text>
      {/* Comments (mocked) */}
      <Text style={styles.sectionTitle}>Comments</Text>
      <View style={styles.commentBox}>
        <Text style={styles.commentUser}>Jane Doe</Text>
        <Text style={styles.commentText}>Great app! Helped me stay focused.</Text>
      </View>
      <View style={styles.commentBox}>
        <Text style={styles.commentUser}>Alex Smith</Text>
        <Text style={styles.commentText}>Love the design and features.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 22,
    marginBottom: 18,
    marginTop: 6,
  },
  appName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 12,
    fontSize: 16,
  },
  downloads: {
    color: '#94A3B8',
    fontSize: 14,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  commentBox: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  commentUser: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    color: '#fff',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
