import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, wsClient, Room, Message, User, handleAPIError } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatContextType {
  currentRoom: Room | null;
  messages: Message[];
  typingUsers: Array<{ userId: string; nickname: string }>;
  onlineUsers: Array<{ userId: string; nickname: string; joinedAt: Date }>;
  isConnected: boolean;
  isLoading: boolean;
  
  // Room Management
  joinRoom: (roomCode: string, password?: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  createRoom: (roomData: any) => Promise<{ roomCode: string; room: Room }>;
  
  // Messaging
  sendMessage: (content: string, type?: string, metadata?: any) => Promise<void>;
  sendFile: (file: File, metadata?: any) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  
  // Real-time features
  startTyping: () => void;
  stopTyping: () => void;
  
  // File sharing
  shareFile: (file: File, options?: any) => Promise<{ shareId: string; url: string }>;
  
  // Room settings
  updateRoomSettings: (settings: Partial<Room['settings']>) => Promise<void>;
  
  // Load more messages
  loadMoreMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; nickname: string }>>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; nickname: string; joinedAt: Date }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Real-time event handlers
  useEffect(() => {
    if (!isAuthenticated || !wsClient.isConnected()) return;

    // Room events
    wsClient.on('room_joined', handleRoomJoined);
    wsClient.on('room_left', handleRoomLeft);
    wsClient.on('user_joined', handleUserJoined);
    wsClient.on('user_left', handleUserLeft);
    
    // Message events
    wsClient.on('new_message', handleNewMessage);
    wsClient.on('message_read', handleMessageRead);
    wsClient.on('message_reaction', handleMessageReaction);
    wsClient.on('message_destroyed', handleMessageDestroyed);
    wsClient.on('recent_messages', handleRecentMessages);
    
    // Typing events
    wsClient.on('user_typing', handleUserTyping);
    
    // File sharing events
    wsClient.on('file_shared_notification', handleFileShared);
    
    // Video call events
    wsClient.on('video_call_invite', handleVideoCallInvite);
    wsClient.on('video_call_response', handleVideoCallResponse);
    
    // Error handling
    wsClient.on('error', handleWebSocketError);

    return () => {
      // Cleanup event listeners
      wsClient.off('room_joined', handleRoomJoined);
      wsClient.off('room_left', handleRoomLeft);
      wsClient.off('user_joined', handleUserJoined);
      wsClient.off('user_left', handleUserLeft);
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('message_read', handleMessageRead);
      wsClient.off('message_reaction', handleMessageReaction);
      wsClient.off('message_destroyed', handleMessageDestroyed);
      wsClient.off('recent_messages', handleRecentMessages);
      wsClient.off('user_typing', handleUserTyping);
      wsClient.off('file_shared_notification', handleFileShared);
      wsClient.off('video_call_invite', handleVideoCallInvite);
      wsClient.off('video_call_response', handleVideoCallResponse);
      wsClient.off('error', handleWebSocketError);
    };
  }, [isAuthenticated]);

  // Event Handlers
  const handleRoomJoined = (data: { room: Room; encryptionKey: string; encryptionFingerprint: string }) => {
    setCurrentRoom(data.room);
    setMessages([]);
    setOnlineUsers(data.room.activeUsers.filter(u => u.isOnline).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
      joinedAt: u.joinedAt
    })));
    setIsConnected(true);
    
    // Store encryption key for this room
    localStorage.setItem(`room_${data.room.roomId}_key`, data.encryptionKey);
    
    toast({
      title: "Joined Room",
      description: `Welcome to ${data.room.name}`,
    });
  };

  const handleRoomLeft = (data: { roomId: string }) => {
    if (currentRoom?.roomId === data.roomId) {
      setCurrentRoom(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
      setIsConnected(false);
      
      // Clear encryption key
      localStorage.removeItem(`room_${data.roomId}_key`);
    }
  };

  const handleUserJoined = (data: { user: { userId: string; nickname: string; joinedAt: Date }; message: string }) => {
    setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.user.userId), data.user]);
    
    // Add system message
    const systemMessage: Message = {
      _id: `system_${Date.now()}`,
      messageId: `system_${Date.now()}`,
      roomId: currentRoom?.roomId || '',
      senderId: 'system',
      senderNickname: 'System',
      content: data.message,
      type: 'system',
      status: 'sent',
      readBy: [],
      reactions: [],
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleUserLeft = (data: { userId: string; nickname: string; message: string }) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    
    // Add system message
    const systemMessage: Message = {
      _id: `system_${Date.now()}`,
      messageId: `system_${Date.now()}`,
      roomId: currentRoom?.roomId || '',
      senderId: 'system',
      senderNickname: 'System',
      content: data.message,
      type: 'system',
      status: 'sent',
      readBy: [],
      reactions: [],
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.find(m => m.messageId === message.messageId)) {
        return prev;
      }
      return [...prev, message].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    
    // Auto-mark as read if message is visible
    if (message.senderId !== user?.userId && document.visibilityState === 'visible') {
      setTimeout(() => markMessageAsRead(message.messageId), 1000);
    }
  };

  const handleRecentMessages = (data: { messages: Message[] }) => {
    setMessages(data.messages);
    setHasMoreMessages(data.messages.length === 50); // Assuming 50 is the limit
  };

  const handleMessageRead = (data: { messageId: string; readBy: string; nickname: string; readAt: Date }) => {
    setMessages(prev => prev.map(msg => {
      if (msg.messageId === data.messageId) {
        const readBy = [...msg.readBy];
        const existingIndex = readBy.findIndex(r => r.userId === data.readBy);
        
        if (existingIndex >= 0) {
          readBy[existingIndex] = { userId: data.readBy, nickname: data.nickname, readAt: data.readAt };
        } else {
          readBy.push({ userId: data.readBy, nickname: data.nickname, readAt: data.readAt });
        }
        
        return { ...msg, readBy };
      }
      return msg;
    }));
  };

  const handleMessageReaction = (data: { messageId: string; userId: string; reaction: string; reactions: Message['reactions'] }) => {
    setMessages(prev => prev.map(msg => 
      msg.messageId === data.messageId 
        ? { ...msg, reactions: data.reactions }
        : msg
    ));
  };

  const handleMessageDestroyed = (data: { messageId: string }) => {
    setMessages(prev => prev.filter(msg => msg.messageId !== data.messageId));
  };

  const handleUserTyping = (data: { userId: string; nickname: string; isTyping: boolean }) => {
    if (data.userId === user?.userId) return; // Ignore own typing
    
    setTypingUsers(prev => {
      if (data.isTyping) {
        return [...prev.filter(u => u.userId !== data.userId), { userId: data.userId, nickname: data.nickname }];
      } else {
        return prev.filter(u => u.userId !== data.userId);
      }
    });
  };

  const handleFileShared = (data: { from: string; fromNickname: string; fileId: string; fileName: string; fileSize: number; sharedAt: Date }) => {
    toast({
      title: "File Shared",
      description: `${data.fromNickname} shared ${data.fileName}`,
    });
  };

  const handleVideoCallInvite = (data: { from: string; fromNickname: string; roomId: string }) => {
    toast({
      title: "Video Call Invitation",
      description: `${data.fromNickname} is inviting you to a video call`,
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => acceptVideoCall(data.from, data.roomId)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Accept
          </button>
          <button
            onClick={() => declineVideoCall(data.from, data.roomId)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Decline
          </button>
        </div>
      ),
    });
  };

  const handleVideoCallResponse = (data: { from: string; fromNickname: string; accepted: boolean; roomId: string }) => {
    if (data.accepted) {
      toast({
        title: "Call Accepted",
        description: `${data.fromNickname} accepted your video call`,
      });
      // Redirect to video call interface
      window.open(`/video/${data.roomId}`, '_blank');
    } else {
      toast({
        title: "Call Declined",
        description: `${data.fromNickname} declined your video call`,
        variant: "destructive"
      });
    }
  };

  const handleWebSocketError = (error: any) => {
    console.error('WebSocket error:', error);
    toast({
      variant: "destructive",
      title: "Connection Error",
      description: error.message || "Real-time connection error",
    });
  };

  // Action Methods
  const joinRoom = async (roomCode: string, password?: string) => {
    try {
      setIsLoading(true);
      const { room, encryptionKey, encryptionFingerprint } = await api.joinRoom(roomCode, password);
      
      // Emit join room event to WebSocket
      wsClient.emit('join_room', { roomId: room.roomId, roomCode });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to join room");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;
    
    try {
      await api.leaveRoom(currentRoom.roomId);
      wsClient.emit('leave_room', { roomId: currentRoom.roomId });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to leave room");
    }
  };

  const createRoom = async (roomData: any) => {
    try {
      setIsLoading(true);
      const { room, roomCode, encryptionFingerprint } = await api.createRoom(roomData);
      
      // Auto-join the created room
      wsClient.emit('join_room', { roomId: room.roomId, roomCode });
      
      return { roomCode, room };
    } catch (error) {
      handleAPIError(error as Error, "Failed to create room");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, type = 'text', metadata = {}) => {
    if (!currentRoom || !content.trim()) return;
    
    try {
      // Create optimistic message
      const optimisticMessage: Message = {
        _id: `temp_${Date.now()}`,
        messageId: `temp_${Date.now()}`,
        roomId: currentRoom.roomId,
        senderId: user?.userId || '',
        senderNickname: user?.nickname || '',
        content,
        type: type as any,
        status: 'sending',
        readBy: [],
        reactions: [],
        metadata,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send via WebSocket
      wsClient.emit('send_message', {
        roomId: currentRoom.roomId,
        content,
        type,
        metadata
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to send message");
    }
  };

  const sendFile = async (file: File, metadata = {}) => {
    if (!currentRoom) return;
    
    try {
      // Upload file first
      const { file: uploadedFile } = await api.uploadFile(file, {
        roomId: currentRoom.roomId,
        ...metadata
      });
      
      // Send file message
      await sendMessage(`File: ${file.name}`, 'file', {
        fileId: uploadedFile.fileId,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: uploadedFile.url
      });
      
      // Notify about file sharing
      wsClient.emit('file_shared', {
        roomId: currentRoom.roomId,
        fileId: uploadedFile.fileId,
        fileName: file.name,
        fileSize: file.size
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to send file");
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      wsClient.emit('mark_message_read', { messageId });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    try {
      wsClient.emit('add_reaction', { messageId, reaction });
    } catch (error) {
      handleAPIError(error as Error, "Failed to add reaction");
    }
  };

  const startTyping = () => {
    if (currentRoom) {
      wsClient.emit('typing_start', { roomId: currentRoom.roomId });
    }
  };

  const stopTyping = () => {
    if (currentRoom) {
      wsClient.emit('typing_stop', { roomId: currentRoom.roomId });
    }
  };

  const shareFile = async (file: File, options = {}) => {
    try {
      const { file: uploadedFile } = await api.uploadFile(file, options);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} is ready to share`,
      });
      
      return {
        shareId: uploadedFile.shareId,
        url: uploadedFile.url
      };
    } catch (error) {
      handleAPIError(error as Error, "Failed to upload file");
      throw error;
    }
  };

  const updateRoomSettings = async (settings: Partial<Room['settings']>) => {
    if (!currentRoom) return;
    
    try {
      const { settings: updatedSettings } = await api.updateRoomSettings(currentRoom.roomId, settings);
      
      setCurrentRoom(prev => prev ? {
        ...prev,
        settings: updatedSettings
      } : null);
      
      toast({
        title: "Room Settings Updated",
        description: "Changes have been applied",
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to update room settings");
    }
  };

  const loadMoreMessages = async () => {
    if (!currentRoom || !hasMoreMessages || isLoading) return;
    
    try {
      setIsLoading(true);
      const oldestMessage = messages[0];
      const before = oldestMessage ? oldestMessage.createdAt.toISOString() : undefined;
      
      const { messages: olderMessages, hasMore } = await api.getRoomMessages(
        currentRoom.roomId,
        50,
        before
      );
      
      setMessages(prev => [...olderMessages, ...prev]);
      setHasMoreMessages(hasMore);
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to load more messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Video call helpers
  const acceptVideoCall = (fromUserId: string, roomId: string) => {
    wsClient.emit('video_call_response', {
      targetUserId: fromUserId,
      accepted: true,
      roomId
    });
    window.open(`/video/${roomId}`, '_blank');
  };

  const declineVideoCall = (fromUserId: string, roomId: string) => {
    wsClient.emit('video_call_response', {
      targetUserId: fromUserId,
      accepted: false,
      roomId
    });
  };

  const value: ChatContextType = {
    currentRoom,
    messages,
    typingUsers,
    onlineUsers,
    isConnected: wsClient.isConnected(),
    isLoading,
    joinRoom,
    leaveRoom,
    createRoom,
    sendMessage,
    sendFile,
    markMessageAsRead,
    addReaction,
    startTyping,
    stopTyping,
    shareFile,
    updateRoomSettings,
    loadMoreMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
