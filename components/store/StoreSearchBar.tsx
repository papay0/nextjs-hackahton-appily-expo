import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function StoreSearchBar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search apps..."
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
});
