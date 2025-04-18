import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppIcon from './AppIcon';

// Define the app data structure
export interface AppData {
  id: string;
  name: string;
  icon: string;
  url?: string;
}

interface AppGridProps {
  apps: AppData[];
  onAppPress?: (app: AppData) => void;
}

// iOS typically shows 4 icons per row on iPhone
const NUM_COLUMNS = 4;

export default function AppGrid({ apps, onAppPress }: AppGridProps) {
  
  // Calculate rows based on number of apps (4 per row)
  const appRows: AppData[][] = [];
  
  // Group apps into rows of 4
  for (let i = 0; i < apps.length; i += NUM_COLUMNS) {
    appRows.push(apps.slice(i, i + NUM_COLUMNS));
  }
  
  return (
    <View style={styles.container}>
      {appRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((app) => (
            <AppIcon
              key={app.id}
              name={app.name}
              icon={app.icon}
              url={app.url}
              onPress={() => onAppPress && onAppPress(app)}
            />
          ))}
          
          {/* Fill empty slots in the last row */}
          {row.length < NUM_COLUMNS &&
            Array(NUM_COLUMNS - row.length)
              .fill(0)
              .map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptySlot} />
              ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  emptySlot: {
    width: 80,
    height: 110,
  },
}); 