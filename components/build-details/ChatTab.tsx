import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '@/hooks/useSharedProjectData';

// Styled Message Item component
const MessageItem = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isAssistant = message.sender === 'assistant';
  
  // Helper to handle message type styling
  const getMessageStyle = () => {
    if (isUser) return styles.userMessageContainer;
    if (isSystem) return styles.systemMessageContainer;
    
    // Handle assistant message styling based on type
    if (isAssistant) {
      switch (message.type) {
        case 'status_update':
          return styles.statusMessageContainer;
        case 'initial_prompt':
          return styles.initialPromptMessageContainer;
        case 'follow_up':
          return styles.followUpMessageContainer;
        case 'llm_text':
        default:
          return styles.assistantMessageContainer;
      }
    }
    
    return styles.assistantMessageContainer;
  };
  
  // Helper for text styling
  const getTextStyle = () => {
    if (isUser) return styles.userMessageText;
    if (isSystem) return styles.systemMessageText;
    
    // Handle assistant text styling based on type
    if (isAssistant) {
      switch (message.type) {
        case 'status_update':
          return styles.statusMessageText;
        case 'initial_prompt':
          return styles.initialPromptMessageText;
        case 'follow_up':
          return styles.followUpMessageText;
        case 'llm_text':
        default:
          return styles.assistantMessageText;
      }
    }
    
    return styles.assistantMessageText;
  };
  
  // Determine if we should show the footer (not on status updates)
  const showFooter = !(isAssistant && message.type === 'status_update');
  
  return (
    <View style={[styles.messageContainer, getMessageStyle()]}>
      {/* Message content */}
      <Text style={[styles.messageText, getTextStyle()]}>
        {message.content}
      </Text>
      
      {/* Message timestamp and sender info */}
      {showFooter && (
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp
          ]}>
            {message.timestamp}
          </Text>
          
          {isUser && (
            <View style={styles.senderIndicator}>
              <View style={styles.senderDot} />
              <Text style={styles.senderText}>You</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Empty state component
const EmptyChatState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyContent}>
      <Ionicons name="sparkles-outline" size={32} color="#3B82F6" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptyText}>
        Start a conversation! Ask about your app idea or how to implement specific features.
      </Text>
    </View>
  </View>
);

type ChatTabProps = {
  projectId: string;
  initialPrompt?: string;
  messages?: Message[];
  loading?: boolean;
  error?: Error | null;
  onSendMessage?: (message: string) => Promise<boolean | undefined>;
  isAssistantResponding?: boolean;
};

export default function ChatTab({ 
  projectId, 
  initialPrompt,
  messages = [], 
  loading = false, 
  error = null,
  onSendMessage,
  isAssistantResponding = false
}: ChatTabProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const inputAccessoryViewID = "uniqueChatInputID";
  
  // Format current time for message timestamps
  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Show the initial prompt as the first message optimistically
  useEffect(() => {
    if (initialPrompt && messages.length === 0 && localMessages.length === 0) {
      const promptMessage: Message = {
        id: 'initial-prompt',
        sender: 'user',
        content: initialPrompt,
        timestamp: getCurrentTime(),
        createdAt: {
          toDate: () => new Date()
        } as any
      };
      
      setLocalMessages([
        promptMessage,
        {
          id: 'system-processing',
          sender: 'system',
          content: 'Processing your request...',
          timestamp: getCurrentTime(),
          createdAt: {
            toDate: () => new Date()
          } as any
        }
      ]);
    }
  }, [initialPrompt, messages.length, localMessages.length]);
  
  // Use server-side messages once they're loaded
  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages([]);
    }
  }, [messages]);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (flatListRef.current && (messages.length > 0 || localMessages.length > 0)) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, localMessages.length]);
  
  const handleSend = useCallback(async () => {
    if (inputMessage.trim().length === 0 || isSending || isAssistantResponding) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: getCurrentTime(),
      createdAt: {
        toDate: () => new Date()
      } as any
    };
    
    // Update UI immediately with user message
    setLocalMessages(prev => [...prev, userMessage]);
    
    // Clear input and show loading state
    setInputMessage('');
    setIsSending(true);
    
    try {
      // Add a "sending" system message
      const sendingId = Date.now().toString() + '-sending';
      setLocalMessages(prev => [
        ...prev, 
        {
          id: sendingId,
          sender: 'system',
          content: 'Sending message...',
          timestamp: getCurrentTime(),
          createdAt: {
            toDate: () => new Date()
          } as any
        }
      ]);
      
      // Send message using the provided handler function
      if (onSendMessage) {
        const success = await onSendMessage(userMessage.content);
        
        // Remove "sending" message and add success/error message based on result
        setLocalMessages(prev => 
          prev.filter(msg => msg.id !== sendingId).concat({
            id: Date.now().toString(),
            sender: 'system',
            content: success 
              ? 'Message sent. Processing response...' 
              : 'Error: Failed to process message',
            timestamp: getCurrentTime(),
            createdAt: {
              toDate: () => new Date()
            } as any
          })
        );
      } else {
        // Fallback behavior if no handler is provided
        setLocalMessages(prev => 
          prev.filter(msg => msg.id !== sendingId).concat({
            id: Date.now().toString(),
            sender: 'system',
            content: 'Message sent. No handler provided for processing.',
            timestamp: getCurrentTime(),
            createdAt: {
              toDate: () => new Date()
            } as any
          })
        );
      }
    } catch (error) {
      // Handle error
      console.error('Error sending message:', error);
      setLocalMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          sender: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
          timestamp: getCurrentTime(),
          createdAt: {
            toDate: () => new Date()
          } as any
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, isAssistantResponding, onSendMessage]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Determine if the send button should be disabled
  const isSendDisabled = inputMessage.trim().length === 0 || isSending || isAssistantResponding;

  const renderInputField = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={isAssistantResponding ? "AI is generating code..." : "Type your message..."}
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        multiline
        value={inputMessage}
        onChangeText={setInputMessage}
        inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
        editable={!isSending}
        selectionColor="#3B82F6"
      />
      
      <TouchableOpacity 
        style={[
          styles.sendButton,
          !isSendDisabled ? styles.sendButtonActive : styles.sendButtonInactive
        ]}
        disabled={isSendDisabled}
        onPress={handleSend}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isAssistantResponding ? (
          <Ionicons name="hourglass-outline" size={18} color="rgba(255, 255, 255, 0.5)" />
        ) : (
          <Ionicons 
            name="paper-plane" 
            size={18} 
            color={inputMessage.trim().length > 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"} 
          />
        )}
      </TouchableOpacity>
    </View>
  );
  
  if (loading && messages.length === 0 && localMessages.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error && messages.length === 0 && localMessages.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }
  
  const displayMessages = messages.length > 0 ? messages : localMessages;
  
  return (
    <View style={styles.container}>
      
      {/* Message List or Empty State */}
      {displayMessages.length === 0 ? (
        <EmptyChatState />
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.chatList}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageItem message={item} />}
          contentContainerStyle={styles.chatContentContainer}
          onScrollBeginDrag={dismissKeyboard}
        />
      )}
      
      {isAssistantResponding && (
        <View style={styles.notificationBanner}>
          <Ionicons name="information-circle-outline" size={14} color="#3B82F6" />
          <Text style={styles.notificationText}>
            AI is building your app. Wait for completion to send your next message.
          </Text>
        </View>
      )}
      
      {/* Simple keyboard handling approach */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[
          styles.inputWrapper,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
        ]}>
          {renderInputField()}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chatList: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 100, // Give extra space for the input
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContent: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '70%',
  },
  statusMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  initialPromptMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderLeftColor: '#10B981', // Green accent
    borderLeftWidth: 3,
  },
  followUpMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderLeftColor: '#F59E0B', // Amber accent
    borderLeftWidth: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#FFFFFF',
  },
  systemMessageText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
  },
  statusMessageText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
  },
  initialPromptMessageText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  followUpMessageText: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    fontSize: 15,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  senderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  senderDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 4,
  },
  senderText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Simplified keyboard and input handling
  keyboardAvoidingContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputWrapper: {
    backgroundColor: '#1E293B', // Solid background to prevent transparency
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 2,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  notificationBanner: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginHorizontal: 16,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});