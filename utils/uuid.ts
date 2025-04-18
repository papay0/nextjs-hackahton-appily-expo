import 'react-native-get-random-values'; // This needs to be imported before uuid
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4 for unique identifiers
 * Using the standard uuid library for proper implementation
 */
export function generateUUID(): string {
  return uuidv4();
} 