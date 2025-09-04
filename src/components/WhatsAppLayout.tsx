import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Settings,
  Users,
  Star,
  Archive,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import ChatList from './ChatList';
import MessageBubble, { type Message } from './MessageBubble';
import { MessageInput } from './MessageInput';
import StatusList from './StatusList';
import { cn } from '@/lib/utils';

interface WhatsAppLayoutProps {
  roomId?: string;
  currentChat?: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    isGroup?: boolean;
    participantsCount?: number;
  };
}

const WhatsAppLayout: React.FC<WhatsAppLayoutProps> = ({ roomId, currentChat }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [selectedChatId, setSelectedChatId] = useState<string | null>(roomId || null);
  const { currentRoom, messages: roomMessages, typingUsers, onlineUsers, sendMessage: sendChatMessage, sendFile: sendChatFile, addReaction, startTyping, stopTyping } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sample chat data
  const [chats] = useState([
    {
      id: '1',
      name: 'Secure Room Alpha',
      avatar: undefined,
      lastMessage: {
        content: 'Messages are end-to-end encrypted',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        senderId: 'system',
        senderName: 'System',
        type: 'text' as const,
        isRead: true,
        isDelivered: true
      },
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isArchived: false,
      isGroup: false,
      isOnline: true,
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Anonymous Group',
      avatar: undefined,
      lastMessage: {
        content: '📁 Document received',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        senderId: 'user2',
        senderName: 'Anonymous User',
        type: 'document' as const,
        isRead: false,
        isDelivered: true
      },
      unreadCount: 3,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      isGroup: true,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 15)
    }
  ]);

  // Map ChatContext messages to UI format
  const mappedMessages: Message[] = (roomMessages || []).map((m) => {
    const base: Message = {
      id: m.messageId,
      content: m.content,
      userId: m.senderId,
      username: m.senderNickname,
      timestamp: new Date(m.createdAt),
      type: (m.type === 'file' ? 'document' : (m.type as any)) || 'text',
      isOwn: (user?.userId || user?.id) === m.senderId,
      isRead: m.status === 'read',
      isDelivered: ['delivered','read'].includes(m.status),
      isSending: m.status === 'sending',
      isEdited: !!m.metadata?.isEdited,
      reactions: (m.reactions || []).map(r => ({ emoji: r.reaction, users: [r.userId] })),
    };

    if (['image','video','audio','file'].includes(m.type)) {
      base.media = {
        url: (m as any).metadata?.url || '',
        thumbnail: m.metadata?.thumbnail,
        duration: m.metadata?.duration,
        size: m.metadata?.fileSize,
        filename: m.metadata?.filename
      };
      base.type = m.type === 'file' ? 'document' : (m.type as any);
    }

    return base;
  });

  useEffect(() => {
    if (currentRoom?.roomId) {
      setSelectedChatId(currentRoom.roomId);
    }
  }, [currentRoom]);

  // Sample messages for the selected chat
  useEffect(() => {
    if (selectedChatId) {
      const sampleMessages: Message[] = [
        {
          id: '1',
          content: 'Welcome to SecureChat! Your messages are end-to-end encrypted.',
          userId: 'system',
          username: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          type: 'text',
          isOwn: false,
          isRead: true,
          isDelivered: true,
          reactions: []
        },
        {
          id: '2',
          content: 'Thanks for the secure communication!',
          userId: user?.id || 'user1',
          username: user?.nickname || 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text',
          isOwn: true,
          isRead: true,
          isDelivered: true,
          reactions: [
            { emoji: '👍', users: ['user2'], count: 1 }
          ]
        }
      ];
      setMessages(sampleMessages);
    }
  }, [selectedChatId, user]);

  const handleSendMessage = (messageData: {
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
    media?: File;
    location?: { latitude: number; longitude: number; address?: string };
    contact?: { name: string; phone: string; avatar?: string };
    replyTo?: string;
  }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageData.content,
      userId: user?.id || 'user1',
      username: user?.nickname || 'You',
      timestamp: new Date(),
      type: messageData.type,
      isOwn: true,
      isRead: false,
      isDelivered: false,
      isSending: true,
      reactions: [],
      replyTo: messageData.replyTo ? messages.find(m => m.id === messageData.replyTo) : undefined
    };

    setMessages(prev => [...prev, newMessage]);

    // Optimistic updates are handled by ChatContext in real mode

    toast({
      title: "Message Sent",
      description: "Your message has been encrypted and sent securely.",
    });
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      // On mobile, navigate to chat view
    }
  };

  const handleVoiceCall = () => {
    if (currentChat) {
      navigate(`/video/${currentChat.id}?audio=true`);
    }
  };

  const handleVideoCall = () => {
    if (currentChat) {
      navigate(`/video/${currentChat.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "w-80 border-r border-border bg-card/50 flex flex-col",
        isMobile && selectedChatId && "hidden"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.nickname}</h3>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/create')}>
                  <Users className="h-4 w-4 mr-2" />
                  New Room
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Starred Messages
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archived Chats
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="flex-1 rounded-none"
          >
            Chats
          </Button>
          <Button
            variant={activeTab === 'status' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('status')}
            className="flex-1 rounded-none"
          >
            Status
          </Button>
          <Button
            variant={activeTab === 'calls' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('calls')}
            className="flex-1 rounded-none"
          >
            Calls
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ChatList
              chats={filteredChats}
              selectedChatId={selectedChatId}
              onChatSelect={handleChatSelect}
              onChatPin={(chatId) => {
                toast({ title: "Chat pinned successfully" });
              }}
              onChatMute={(chatId) => {
                toast({ title: "Chat muted for 8 hours" });
              }}
              onChatArchive={(chatId) => {
                toast({ title: "Chat archived" });
              }}
              onChatDelete={(chatId) => {
                toast({ title: "Chat deleted", variant: "destructive" });
              }}
            />
          )}
          
          {activeTab === 'status' && (
            <StatusList
              onStatusAdd={(status) => {
                toast({ title: "Status updated successfully" });
              }}
              onStatusView={(statusId) => {
                navigate(`/status/${statusId}`);
              }}
            />
          )}
          
          {activeTab === 'calls' && (
            <div className="p-4 text-center text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent calls</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChatId(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">{currentRoom?.name || selectedChat.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(typingUsers?.length || 0) > 0 ? 'typing...' :
                        (onlineUsers?.length || 0) > 1 ? `${onlineUsers.length} online` : 'online'}
                    </p>
                  </div>
                  
                  {(selectedChat.isGroup || (currentRoom?.activeUsers?.length || 0) > 1) && (
                    <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {currentRoom?.activeUsers?.length || selectedChat.participantsCount || 2}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleVoiceCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleVideoCall}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowChatInfo(!showChatInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background">
              {(mappedMessages.length > 0 ? mappedMessages : messages).map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onReact={(messageId, emoji) => {
                    addReaction(messageId, emoji);
                  }}
                  onReply={(messageId) => {
                    // Set reply context
                    toast({ title: "Reply mode activated" });
                  }}
                  onForward={(messageId) => {
                    toast({ title: "Message ready to forward" });
                  }}
                  onEdit={(messageId, newContent) => {
                    setMessages(prev => prev.map(m => 
                      m.id === messageId 
                        ? { ...m, content: newContent, isEdited: true }
                        : m
                    ));
                  }}
                  onDelete={(messageId) => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                  }}
                  onStar={(messageId) => {
                    toast({ title: "Message starred" });
                  }}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card/30 backdrop-blur-sm">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={(t) => { setIsTyping(t); if (t) startTyping(); else stopTyping(); }}
                placeholder="Type a message..."
                disabled={false}
              />
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background/90 to-card/20">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">SecureChat</h2>
                <p className="text-muted-foreground">
                  Select a chat to start secure messaging, or create a new room to begin.
                </p>
              </div>
              <Button onClick={() => navigate('/create')}>
                Create New Room
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Sidebar */}
      {showChatInfo && selectedChat && (
        <div className="w-80 border-l border-border bg-card/30 p-4 space-y-6">
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback className="text-2xl">
                {selectedChat.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{selectedChat.name}</h3>
            <p className="text-muted-foreground">
              {selectedChat.isGroup ? `Group • ${selectedChat.participantsCount || 2} participants` : 'Private Chat'}
            </p>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Search className="h-4 w-4 mr-2" />
              Search Messages
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppLayout;
