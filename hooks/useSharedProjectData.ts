import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp, doc } from 'firebase/firestore';
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

export type AssistantMessageType = 'status_update' | 'llm_text' | 'follow_up' | 'initial_prompt';

export interface Message {
  id: string;
  sender: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  type?: AssistantMessageType;
}

export interface ResultData {
  deployUrl?: string;
  success?: boolean;
  buildError?: string;
  lintError?: string;
  hasActualLintErrors?: boolean;
}

export interface ProjectData {
  codeFiles: {
    data: CodeFile[];
    loading: boolean;
    error: Error | null;
  };
  messages: {
    data: Message[];
    loading: boolean;
    error: Error | null;
  };
  logs: {
    data: string[];
    loading: boolean;
    error: Error | null;
  };
  result: {
    data: ResultData | null;
    loading: boolean;
    error: Error | null;
  };
  status: {
    value: 'initializing' | 'generating' | 'complete' | 'failed' | null;
    loading: boolean;
    error: Error | null;
  };
}

export function useSharedProjectData(projectId: string | null): ProjectData {
  // Code files state
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [codeFilesLoading, setCodeFilesLoading] = useState(true);
  const [codeFilesError, setCodeFilesError] = useState<Error | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<Error | null>(null);
  
  // Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<Error | null>(null);
  
  // Result data (includes deployUrl)
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const [resultError, setResultError] = useState<Error | null>(null);
  
  // Project status
  const [projectStatus, setProjectStatus] = useState<'initializing' | 'generating' | 'complete' | 'failed' | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<Error | null>(null);

  // Load code files
  useEffect(() => {
    if (!projectId) {
      setCodeFiles([]);
      setCodeFilesLoading(false);
      return () => {};
    }

    setCodeFilesLoading(true);
    
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
        setCodeFilesLoading(false);
      },
      (err) => {
        console.error('Error getting code files:', err);
        setCodeFilesError(err as Error);
        setCodeFilesLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  // Load project status (from the main project document)
  useEffect(() => {
    if (!projectId) {
      setProjectStatus(null);
      setStatusLoading(false);
      return () => {};
    }

    setStatusLoading(true);
    
    // Create a reference to the project document
    const projectDocRef = doc(db, `projects/${projectId}`);
    
    // Listen for changes to the project document
    const unsubscribe = onSnapshot(
      projectDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('Project status updated:', data.status);
          setProjectStatus(data.status || null);
        } else {
          console.log('No project document found');
          setProjectStatus(null);
        }
        setStatusLoading(false);
      },
      (err) => {
        console.error('Error getting project status:', err);
        setStatusError(err as Error);
        setStatusLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  // Load messages
  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      setMessagesLoading(false);
      return () => {};
    }

    setMessagesLoading(true);
    
    // Use the chat collection instead of messages collection
    const chatRef = collection(db, `projects/${projectId}/chat`);
    const chatQuery = query(chatRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(
      chatQuery,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Determine message type and ensure it's a valid AssistantMessageType
          let messageType: AssistantMessageType | undefined = undefined;
          if (data.type && data.sender === 'assistant') {
            if (['status_update', 'llm_text', 'follow_up', 'initial_prompt'].includes(data.type)) {
              messageType = data.type as AssistantMessageType;
            }
          }
          
          msgs.push({
            id: doc.id,
            // Map 'human' sender to 'user' for compatibility
            sender: data.sender === 'human' ? 'user' : data.sender,
            content: data.content || '',
            timestamp: data.timestamp || '',
            createdAt: data.createdAt || Timestamp.now(),
            // Add type for message styling if available and valid
            type: messageType
          } as Message);
        });
        
        setMessages(msgs);
        setMessagesLoading(false);
      },
      (err) => {
        console.error('Error getting messages:', err);
        setMessagesError(err as Error);
        setMessagesLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  // Load logs from Firestore
  useEffect(() => {
    if (!projectId) {
      setLogs([]);
      setLogsLoading(false);
      return () => {};
    }

    setLogsLoading(true);
    
    // Create a reference to the logs collection
    const logsRef = collection(db, `projects/${projectId}/logs`);
    const logsQuery = query(logsRef, orderBy('createdAt', 'asc'));
    
    // Listen for changes to the logs collection
    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logMessages: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Format the log message based on the data structure and ensure level is included
          let logMessage;
          const level = data.level?.toLowerCase() || 'info';
          
          if (data.message) {
            // If message exists, prepend the log level
            logMessage = `[${level}] ${data.message}`;
          } else if (data.text) {
            // If only text exists
            logMessage = `[${level}] ${data.text}`;
          } else {
            // Fallback
            logMessage = `[${level}] Log entry ${doc.id}`;
          }
          
          logMessages.push(logMessage);
        });
        
        console.log(`Received ${logMessages.length} logs for project ${projectId}`);
        setLogs(logMessages);
        setLogsLoading(false);
      },
      (err) => {
        console.error('Error getting logs:', err);
        setLogsError(err as Error);
        setLogsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  // Load result data (contains deployUrl)
  useEffect(() => {
    if (!projectId) {
      setResultData(null);
      setResultLoading(false);
      return () => {};
    }

    setResultLoading(true);
    
    // Create a reference to the result data document
    const resultDocRef = doc(db, `projects/${projectId}/result/data`);
    
    // Listen for changes to the result data
    const unsubscribe = onSnapshot(
      resultDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as ResultData;
          console.log('Result data updated:', data);
          setResultData(data);
        } else {
          console.log('No result data available yet');
          setResultData(null);
        }
        setResultLoading(false);
      },
      (err) => {
        console.error('Error getting result data:', err);
        setResultError(err as Error);
        setResultLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [projectId]);

  return {
    codeFiles: {
      data: codeFiles,
      loading: codeFilesLoading,
      error: codeFilesError,
    },
    messages: {
      data: messages,
      loading: messagesLoading,
      error: messagesError,
    },
    logs: {
      data: logs,
      loading: logsLoading,
      error: logsError,
    },
    result: {
      data: resultData,
      loading: resultLoading,
      error: resultError,
    },
    status: {
      value: projectStatus,
      loading: statusLoading,
      error: statusError,
    },
  };
} 