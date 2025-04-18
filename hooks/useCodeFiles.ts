import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  status: 'streaming' | 'complete';
  operation: 'create' | 'edit';
  timestamp: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useCodeFiles(projectId: string | null) {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!projectId) {
      setCodeFiles([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    
    const codeFilesRef = collection(db, `projects/${projectId}/codefiles`);
    const codeFilesQuery = query(codeFilesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(
      codeFilesQuery,
      (snapshot) => {
        const files: CodeFile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          files.push({
            id: doc.id,
            path: data.path || '',
            content: data.content || '',
            language: data.language || '',
            status: data.status || 'complete',
            operation: data.operation || 'create',
            timestamp: data.timestamp || '',
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
          } as CodeFile);
        });
        
        setCodeFiles(files);
        setLoading(false);
      },
      (err) => {
        console.error('Error getting code files:', err);
        setError(err as Error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  return { codeFiles, loading, error };
} 