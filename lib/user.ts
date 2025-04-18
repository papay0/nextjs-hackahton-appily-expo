import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseCollections } from './firebase-collections';

export type UserRole = 'regular' | 'premium' | 'admin';

export type User = {
  id: string; // This will be the Clerk userId
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export async function createUserProfile(userData: Omit<User, 'createdAt' | 'updatedAt' | 'role'>) {
  const userRef = doc(db, FirebaseCollections.USERS, userData.id);
  
  // Check if user already exists
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user profile
    const newUser: User = {
      ...userData,
      role: 'regular', // Set default role to regular
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(userRef, newUser);
    return newUser;
  }
  
  return userSnap.data() as User;
}

export async function getUserProfile(userId: string) {
  const userRef = doc(db, FirebaseCollections.USERS, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  
  return null;
}

export async function updateUserProfile(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) {
  const userRef = doc(db, FirebaseCollections.USERS, userId);
  
  // Add updatedAt timestamp
  const updateData = {
    ...data,
    updatedAt: new Date()
  };
  
  await updateDoc(userRef, updateData);
  
  // Get and return the updated profile
  const updatedSnap = await getDoc(userRef);
  return updatedSnap.data() as User;
} 