import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StoreAppData } from './mockApps';

export default function StoreAppList({ apps }: { apps: StoreAppData[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<{ [id: string]: boolean }>({});

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloaded(prev => ({ ...prev, [id]: true }));
      setDownloadingId(null);
    }, 1200);
  };

  return (
    <View>
      <Text style={styles.header}>All Apps</Text>
      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.appRow}>
            <Image source={{ uri: item.iconUrl }} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.downloadBtn}
              disabled={!!downloaded[item.id] || downloadingId === item.id}
              onPress={() => handleDownload(item.id)}
            >
              <Text style={styles.downloadBtnText}>
                {downloaded[item.id] ? 'Downloaded' : downloadingId === item.id ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 2,
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
  name: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 3,
  },
  desc: {
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
