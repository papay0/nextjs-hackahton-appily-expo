import { app, auth, db, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

/**
 * Custom hook for accessing Firebase services
 * @returns Firebase services and helper functions
 */
export function useFirebase() {
  // Firestore helpers
  const getDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  };

  const getCollection = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const addDocument = async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  };

  // Storage helpers
  const uploadFile = async (path: string, file: Blob) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const deleteFile = async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  };

  return {
    // Firebase instances
    app,
    auth,
    db,
    storage,
    
    // Firestore helpers
    getDocument,
    getCollection,
    addDocument,
    updateDocument,
    deleteDocument,
    
    // Storage helpers
    uploadFile,
    deleteFile
  };
} 