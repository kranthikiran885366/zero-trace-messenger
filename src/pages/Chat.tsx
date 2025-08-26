import React from 'react';
import { useParams } from 'react-router-dom';
import WhatsAppLayout from '@/components/WhatsAppLayout';

const Chat = () => {
  const { roomId } = useParams();

  // Get current chat info (in a real app, this would come from API/context)
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
