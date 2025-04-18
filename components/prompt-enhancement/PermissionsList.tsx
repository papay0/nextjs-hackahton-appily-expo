import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../constants/Colors';

export type PermissionsListProps = {
  requiredPermissions: string[];
};

export type CommonPermissionStatus = 'unknown' | 'granted' | 'denied';

export type PermissionStatus = {
  status: CommonPermissionStatus;
  requesting: boolean;
};

type PermissionHandler = {
  check: () => Promise<CommonPermissionStatus>;
  request: () => Promise<CommonPermissionStatus>;
};

// Map of permission types to handlers and display info
const PERMISSION_MAP: Record<
  string,
  {
    name: string;
    icon: string;
    handler: PermissionHandler;
  }
> = {
  camera: {
    name: 'Camera',
    icon: 'camera',
    handler: {
      check: async () => {
        const { status } = await Camera.getCameraPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  microphone: {
    name: 'Microphone',
    icon: 'mic',
    handler: {
      check: async () => {
        const { status } = await Camera.getMicrophonePermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await Camera.requestMicrophonePermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  location: {
    name: 'Location',
    icon: 'location',
    handler: {
      check: async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  mediaLibrary: {
    name: 'Media Library',
    icon: 'images',
    handler: {
      check: async () => {
        const { status } = await MediaLibrary.getPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  notifications: {
    name: 'Notifications',
    icon: 'notifications',
    handler: {
      check: async () => {
        const { status } = await Notifications.getPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  contacts: {
    name: 'Contacts',
    icon: 'people',
    handler: {
      check: async () => {
        // Placeholder - would need expo-contacts
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-contacts
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  storage: {
    name: 'Storage',
    icon: 'folder',
    handler: {
      check: async () => {
        // Use MediaLibrary as a proxy for storage
        const { status } = await MediaLibrary.getPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
  calendar: {
    name: 'Calendar',
    icon: 'calendar',
    handler: {
      check: async () => {
        // Placeholder - would need expo-calendar
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-calendar
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  motion: {
    name: 'Motion Sensors',
    icon: 'speedometer',
    handler: {
      check: async () => {
        // Placeholder - would need expo-sensors
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-sensors
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  healthData: {
    name: 'Health Data',
    icon: 'fitness',
    handler: {
      check: async () => {
        // Placeholder - would need health SDK integration
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need health SDK integration
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  bluetooth: {
    name: 'Bluetooth',
    icon: 'bluetooth',
    handler: {
      check: async () => {
        // Placeholder - would need expo-ble
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-ble
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  nfc: {
    name: 'NFC',
    icon: 'wifi',
    handler: {
      check: async () => {
        // Placeholder - would need NFC implementation
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need NFC implementation
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  faceId: {
    name: 'Face ID',
    icon: 'eye',
    handler: {
      check: async () => {
        // Placeholder - would need expo-local-authentication
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-local-authentication
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  touchId: {
    name: 'Touch ID',
    icon: 'finger-print',
    handler: {
      check: async () => {
        // Placeholder - would need expo-local-authentication
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need expo-local-authentication
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  speechRecognition: {
    name: 'Speech Recognition',
    icon: 'mic',
    handler: {
      check: async () => {
        // Placeholder - would need speech recognition API
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - would need speech recognition API
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  backgroundRefresh: {
    name: 'Background Refresh',
    icon: 'refresh',
    handler: {
      check: async () => {
        // Placeholder - not directly requestable on most platforms
        return 'unknown' as CommonPermissionStatus;
      },
      request: async () => {
        // Placeholder - not directly requestable on most platforms
        return 'unknown' as CommonPermissionStatus;
      },
    },
  },
  backgroundLocation: {
    name: 'Background Location',
    icon: 'locate',
    handler: {
      check: async () => {
        const { status } = await Location.getBackgroundPermissionsAsync();
        return status as CommonPermissionStatus;
      },
      request: async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        return status as CommonPermissionStatus;
      },
    },
  },
};

export default function PermissionsList({ requiredPermissions }: PermissionsListProps) {
  const [permissionStatuses, setPermissionStatuses] = useState<Record<string, PermissionStatus>>({});
  const colors = Colors.dark; // Using the dark theme colors

  // Check all required permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const statuses: Record<string, PermissionStatus> = {};

      for (const permission of requiredPermissions) {
        if (PERMISSION_MAP[permission]) {
          try {
            const status = await PERMISSION_MAP[permission].handler.check();
            statuses[permission] = { status, requesting: false };
          } catch (error) {
            console.error(`Error checking ${permission} permission:`, error);
            statuses[permission] = { status: 'unknown', requesting: false };
          }
        }
      }

      setPermissionStatuses(statuses);
    };

    checkPermissions();
  }, [requiredPermissions]);

  // Get valid permissions that exist in our PERMISSION_MAP
  const validPermissions = requiredPermissions.filter(perm => PERMISSION_MAP[perm]);
  
  // If no valid permissions, don't render anything
  if (validPermissions.length === 0) {
    return null;
  }

  const requestPermission = async (permission: string) => {
    if (!PERMISSION_MAP[permission]) return;

    // Set requesting flag
    setPermissionStatuses((prev) => ({
      ...prev,
      [permission]: { ...prev[permission], requesting: true },
    }));

    try {
      const status = await PERMISSION_MAP[permission].handler.request();
      
      setPermissionStatuses((prev) => ({
        ...prev,
        [permission]: { status, requesting: false },
      }));

      if (status === 'denied') {
        Alert.alert(
          'Permission Required',
          `To use this feature, please enable ${PERMISSION_MAP[permission].name} permissions in your device settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error(`Error requesting ${permission} permission:`, error);
      setPermissionStatuses((prev) => ({
        ...prev,
        [permission]: { ...prev[permission], requesting: false },
      }));
      
      Alert.alert('Error', `Failed to request ${PERMISSION_MAP[permission].name} permission.`);
    }
  };

  const renderStatusIcon = (status: CommonPermissionStatus) => {
    if (status === 'granted') {
      return <Ionicons name="checkmark-circle" size={24} color="#34C759" />;
    } else if (status === 'denied') {
      return <Ionicons name="close-circle" size={24} color="#FF3B30" />;
    } else {
      return <Ionicons name="help-circle" size={24} color="#FF9500" />;
    }
  };

  const renderPermissionItem = (permission: string) => {
    if (!PERMISSION_MAP[permission]) {
      return null;
    }

    const permInfo = PERMISSION_MAP[permission];
    const permStatus = permissionStatuses[permission] || { status: 'unknown', requesting: false };
    
    return (
      <View key={permission} style={styles.permissionItem}>
        <View style={styles.permissionInfoContainer}>
          <Ionicons name={permInfo.icon as any} size={24} color={colors.text} style={styles.permissionIcon} />
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionName}>{permInfo.name}</Text>
            <Text style={styles.permissionDescription}>
              Tap "Request Permission" to allow access to your {permInfo.name.toLowerCase()}.
            </Text>
          </View>
          {renderStatusIcon(permStatus.status)}
        </View>
        
        <Pressable
          style={[
            styles.requestButton,
            permStatus.status === 'granted' ? styles.requestButtonDisabled : {}
          ]}
          disabled={permStatus.status === 'granted' || permStatus.requesting}
          onPress={() => requestPermission(permission)}
        >
          <Text style={styles.requestButtonText}>
            {permStatus.requesting
              ? 'Requesting...'
              : permStatus.status === 'granted'
                ? 'Granted'
                : 'Request Permission'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Required Permissions</Text>
      <View style={styles.container}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.description}>
          This app requires the following permissions to enable all features.
        </Text>
        {validPermissions.map(renderPermissionItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  container: {
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  permissionItem: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  permissionInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIcon: {
    marginRight: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  requestButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#34C759',
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 