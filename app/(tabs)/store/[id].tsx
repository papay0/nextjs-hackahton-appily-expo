import React from 'react';
import StoreDetailsScreen from './store-details';
import { useLocalSearchParams } from 'expo-router';

export default function StoreDetailsWrapper() {
  // This will forward the id param to the details screen
  const params = useLocalSearchParams();
  return <StoreDetailsScreen {...params} />;
}
