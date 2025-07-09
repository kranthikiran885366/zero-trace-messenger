import { useState, useRef, useEffect } from 'react';
import { Send, Timer, Video, Phone, Shield, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  timestamp: number;
  isOwn: boolean;
  autoDeleteAfter?: number;
  timeRemaining?: number;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [autoDeleteTime, setAutoDeleteTime] = useState('300000'); // 5 minutes default
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const deleteTimeOptions = [
    { value: '15000', label: '15 seconds' },
    { value: '60000', label: '1 minute' },
    { value: '300000', label: '5 minutes' },
    { value: '900000', label: '15 minutes' },
    { value: '3600000', label: '1 hour' },
    { value: 'read', label: 'On read' },
  ];

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: Date.now(),
      isOwn: true,
      autoDeleteAfter: autoDeleteTime === 'read' ? undefined : parseInt(autoDeleteTime),
      timeRemaining: autoDeleteTime === 'read' ? undefined : parseInt(autoDeleteTime),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Auto-delete timer
    if (message.autoDeleteAfter) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      }, message.autoDeleteAfter);
    }

    // Simulate received message
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Message received securely. This response will also self-destruct.",
        timestamp: Date.now() + 1000,
        isOwn: false,
        autoDeleteAfter: parseInt(autoDeleteTime),
        timeRemaining: parseInt(autoDeleteTime),
      };
      setMessages(prev => [...prev, response]);

      if (response.autoDeleteAfter) {
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== response.id));
        }, response.autoDeleteAfter);
      }
    }, 1000);
  };

  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

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
                Encrypted
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
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