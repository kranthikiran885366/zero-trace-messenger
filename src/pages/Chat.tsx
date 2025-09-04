import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import WhatsAppLayout from '@/components/WhatsAppLayout';
import { useChat } from '@/contexts/ChatContext';

const Chat = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const { currentRoom, joinRoom } = useChat();

  useEffect(() => {
    const state = location.state as { roomCode?: string } | null;
    const roomCode = state?.roomCode;
    if (!roomId) return;
    if (currentRoom?.roomId === roomId) return;
    if (roomCode) {
      joinRoom(roomCode).catch(() => {});
    }
  }, [roomId]);

  const currentChat = roomId ? {
    id: roomId,
    name: `Secure Room ${roomId.slice(-8)}`,
    isOnline: true,
    lastSeen: new Date(),
    isGroup: false
  } : undefined;

  return (
    <div className="h-screen bg-background">
      <WhatsAppLayout roomId={roomId} currentChat={currentChat} />
    </div>
  );
};

export default Chat;
