import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Pin, 
  Archive, 
  VolumeX, 
  Trash2, 
  MessageCircle,
  Users,
  Camera,
  Settings,
  Star,
  Clock,
  CheckCheck,
  Check,
  Mic,
  Image,
  FileText,
  MapPin,
  User as UserIcon
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface ChatListItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
    senderName: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
    isRead: boolean;
    isDelivered: boolean;
  };
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: Date;
  isTyping: boolean;
  typingUsers?: string[];
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  isGroup: boolean;
  groupMembers?: number;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

interface ChatListProps {
  chats: ChatListItem[];
  activeChat?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onArchiveChat: (chatId: string) => void;
  onPinChat: (chatId: string) => void;
  onMuteChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onNewGroup,
  onArchiveChat,
  onPinChat,
  onMuteChat,
  onDeleteChat,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    let filtered = chats;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case 'groups':
        filtered = filtered.filter(chat => chat.isGroup);
        break;
      default:
        // Don't show archived chats in main view
        filtered = filtered.filter(chat => !chat.isArchived);
    }

    // Sort: pinned first, then by last message time
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });
  }, [chats, searchTerm, activeTab]);

  // Get archived chats
  const archivedChats = chats.filter(chat => chat.isArchived);

  // Format time for display
  const formatTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (chatDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (chatDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get last message preview
  const getMessagePreview = (message: ChatListItem['lastMessage']) => {
    switch (message.type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      case 'contact':
        return '👤 Contact';
      default:
        return message.content;
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onNewChat}>
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNewGroup}>
              <Users className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  Starred Messages
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archived Chats ({archivedChats.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="px-4 pt-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {chats.filter(c => c.unreadCount > 0).length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {chats.filter(c => c.unreadCount > 0).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Chat list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No chats found' : 'No chats yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 group",
                  activeChat === chat.id && "bg-primary/10 border border-primary/20"
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {chat.isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        chat.name[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online status indicator */}
                  {!chat.isGroup && chat.isOnline && (
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      getStatusColor(chat.status)
                    )} />
                  )}
                  
                  {/* Pin indicator */}
                  {chat.isPinned && (
                    <Pin className="absolute -top-1 -right-1 h-4 w-4 text-primary fill-current" />
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      "font-medium truncate",
                      chat.unreadCount > 0 && "font-semibold"
                    )}>
                      {chat.name}
                      {chat.isGroup && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({chat.groupMembers} members)
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {chat.lastMessage.senderId === 'you' && !chat.isGroup && (
                        chat.lastMessage.isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : chat.lastMessage.isDelivered ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                      {chat.isMuted && <VolumeX className="h-3 w-3" />}
                      <span>{formatTime(chat.lastMessage.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {chat.isTyping ? (
                        <div className="flex items-center text-primary text-sm">
                          <div className="flex space-x-1 mr-2">
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75" />
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150" />
                          </div>
                          {chat.isGroup ? 
                            `${chat.typingUsers?.[0]} is typing...` : 
                            'typing...'
                          }
                        </div>
                      ) : (
                        <p className={cn(
                          "text-sm text-muted-foreground truncate",
                          chat.unreadCount > 0 && "text-foreground font-medium"
                        )}>
                          {chat.isGroup && chat.lastMessage.senderId !== 'you' && (
                            <span className="text-primary">
                              {chat.lastMessage.senderName}: 
                            </span>
                          )}
                          {getMessagePreview(chat.lastMessage)}
                        </p>
                      )}
                    </div>

                    {/* Unread count */}
                    {chat.unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className={cn(
                          "text-xs min-w-5 h-5 flex items-center justify-center",
                          chat.isMuted && "bg-muted-foreground"
                        )}
                      >
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chat actions menu */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPinChat(chat.id)}>
                        <Pin className="mr-2 h-4 w-4" />
                        {chat.isPinned ? 'Unpin' : 'Pin'} Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMuteChat(chat.id)}>
                        <VolumeX className="mr-2 h-4 w-4" />
                        {chat.isMuted ? 'Unmute' : 'Mute'} Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchiveChat(chat.id)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeleteChat(chat.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button variant="outline" size="sm" onClick={onNewGroup}>
            <Users className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
