import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { User } from 'firebase/auth';
import { signInWithClerk, auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseCollections } from './firebase-collections';
import { User as AppUser } from './user';

type FirebaseAuthContextType = {
  firebaseUser: User | null;
  isFirebaseLoading: boolean;
  firebaseError: Error | null;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  isFirebaseLoading: true,
  firebaseError: null
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  // Add initialization tracking ref to prevent infinite loop
  const isInitializing = useRef(false);

  useEffect(() => {
    const initializeFirebaseAuth = async () => {
      // Guard against re-initialization if already in progress
      if (isInitializing.current) {
        return;
      }
      
      if (!isLoaded || !userId) {
        setIsFirebaseLoading(false);
        return;
      }

      // Set flag to prevent concurrent initializations
      isInitializing.current = true;
      
      try {
        setIsFirebaseLoading(true);
        console.log("Initializing Firebase Auth with Clerk user ID:", userId);
        
        // Get a token for Firebase from Clerk
        const token = await getToken({ template: "integration_firebase" });
        
        if (!token) {
          throw new Error("Failed to get Firebase token from Clerk");
        }
        
        console.log("Got Firebase token from Clerk");
        
        // Sign in to Firebase with the Clerk token
        const fbUser = await signInWithClerk(token);
        console.log("Signed in to Firebase with Clerk token", fbUser?.uid);
        
        // Create/verify user document in Firestore
        if (clerkUser) {
          // Extract user profile data from Clerk
          const displayName = clerkUser.fullName || clerkUser.username || "";
          const email = clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 
            ? clerkUser.emailAddresses[0].emailAddress 
            : "";
          const photoURL = clerkUser.imageUrl || "";
          
          console.log("Creating user with Clerk data:", { displayName, email });
          
          await ensureUserExists(userId, {
            displayName,
            email,
            photoURL
          });
        } else {
          await ensureUserExists(userId);
        }
        
        setFirebaseUser(fbUser);
        setFirebaseError(null);
      } catch (error) {
        console.error("Firebase auth error:", error);
        setFirebaseError(error as Error);
      } finally {
        setIsFirebaseLoading(false);
        // Reset initialization flag
        isInitializing.current = false;
      }
    };
    
    // Function to ensure user exists in Firestore
    const ensureUserExists = async (userId: string, userData?: {
      displayName?: string;
      email?: string;
      photoURL?: string;
    }) => {
      try {
        const userRef = doc(db, FirebaseCollections.USERS, userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          console.log("Creating new user in Firestore:", userId);
          // User doesn't exist, create a new user document with Clerk data if available
          const newUser: AppUser = {
            id: userId,
            displayName: userData?.displayName || "",
            email: userData?.email || "",
            photoURL: userData?.photoURL || "",
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await setDoc(userRef, newUser);
          console.log("User created successfully");
        } else {
          console.log("User already exists in Firestore:", userId);
        }
      } catch (error) {
        console.error("Error ensuring user exists:", error);
        throw error;
      }
    };

    // Only initialize if we have a userId and not already signed in
    if (userId && !firebaseUser && !isInitializing.current) {
      initializeFirebaseAuth();
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Only set the user if it's different to avoid re-renders
        setFirebaseUser(prevUser => {
          if (!prevUser || prevUser.uid !== user.uid) {
            return user;
          }
          return prevUser;
        });
      } else if (firebaseUser) {
        // Only clear if we had a user before
        setFirebaseUser(null);
      }
      
      setIsFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, [isLoaded, userId, clerkUser, firebaseUser, getToken]);

  return (
    <FirebaseAuthContext.Provider value={{ firebaseUser, isFirebaseLoading, firebaseError }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
} 