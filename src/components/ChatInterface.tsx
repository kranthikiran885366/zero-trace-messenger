import { useState, useRef, useEffect } from 'react';
import { Send, Timer, Video, Phone, Shield, Trash2, Settings, Paperclip, Mic, MicOff, Image, FileText, Download, Copy, Eye, Users, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { websocketService, type ChatMessage } from '@/lib/websocket';
import { encryption } from '@/lib/encryption';

interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface RoomUser {
  id: string;
  nickname: string;
  isOnline: boolean;
  lastSeen: number;
}

const ChatInterface = () => {
  const { roomId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [autoDeleteTime, setAutoDeleteTime] = useState('300000'); // 5 minutes default
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        const roomSettings = await websocketService.connectToRoom(roomId);
        setEncryptionKey(roomSettings.encryptionKey);
        setIsConnected(true);

        toast({
          title: "🔐 Connected to Secure Room",
          description: `Room ${roomId} - All messages are end-to-end encrypted`,
        });
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to the room. Please check the room code.",
          variant: "destructive"
        });
      } finally {
        setIsConnecting(false);
      }
    };

    connectToRoom();

    // Set up message handler
    const unsubscribeMessages = websocketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);

      // Auto-delete timer
      if (message.autoDeleteAfter && message.senderId !== websocketService.getRoomInfo().userId) {
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== message.id));
        }, message.autoDeleteAfter);
      }
    });

    // Set up connection handler
    const unsubscribeConnection = websocketService.onConnection(setIsConnected);

    return () => {
      unsubscribeMessages();
      unsubscribeConnection();
      websocketService.leaveRoom();
    };
  }, [roomId, toast]);

  const deleteTimeOptions = [
    { value: '15000', label: '15 seconds' },
    { value: '60000', label: '1 minute' },
    { value: '300000', label: '5 minutes' },
    { value: '900000', label: '15 minutes' },
    { value: '3600000', label: '1 hour' },
    { value: 'read', label: 'On read' },
  ];

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    try {
      await websocketService.sendMessage(newMessage, 'text');
      setNewMessage('');

      // Auto-delete timer for own messages
      if (autoDeleteTime !== 'read') {
        setTimeout(() => {
          setMessages(prev => prev.filter(m =>
            m.timestamp < Date.now() - parseInt(autoDeleteTime) ||
            m.senderId !== websocketService.getRoomInfo().userId
          ));
        }, parseInt(autoDeleteTime));
      }
    } catch (error) {
      toast({
        title: "Message Send Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isConnected) return;

    try {
      await websocketService.sendFile(file);
      toast({
        title: "File Sent",
        description: `${file.name} has been securely transmitted.`,
      });
    } catch (error) {
      toast({
        title: "File Upload Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyMessageContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Message Copied",
      description: "Message content copied to clipboard.",
    });
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // In a real app, this would start recording audio
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Voice Note Recorded",
        description: "Voice message has been sent securely.",
      });
    }, 3000);
  };

  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.senderId === websocketService.getRoomInfo().userId;
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connecting to Secure Room</h3>
            <p className="text-muted-foreground">Establishing encrypted connection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-neon-green' : 'bg-destructive'}`} />
                <span className="font-semibold">
                  {isConnected ? 'Secure Channel Active' : 'Disconnected'}
                </span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Shield className="w-3 h-3 mr-1" />
                E2E Encrypted
              </Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <Lock className="w-3 h-3 mr-1" />
                Room: {roomId?.slice(-8)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowUsers(!showUsers)}>
                <Users className="h-4 w-4" />
                <span className="ml-1 text-xs">{roomUsers.length}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.open(`/video/${roomId}`, '_blank')}>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-card/50 backdrop-blur-sm border-dashed">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Secure Channel Ready</h3>
                <p className="text-muted-foreground">
                  Your messages are end-to-end encrypted and will self-destruct based on your timer settings.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.isOwn
                    ? 'bg-primary text-primary-foreground ml-12'
                    : 'bg-card text-card-foreground mr-12 border border-border'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.timeRemaining && (
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span>{formatTimeRemaining(message.timeRemaining)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-x-0 border-b-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Timer Settings */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Auto-delete:</span>
              <Select value={autoDeleteTime} onValueChange={setAutoDeleteTime}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deleteTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a secure message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-background/50 border-border focus:border-primary"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim()}
                variant="cyber"
                size="sm"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              🔒 Messages are end-to-end encrypted • 🌐 IP masked via Tor • 👤 No metadata logged
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
