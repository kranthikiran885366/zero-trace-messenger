import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Users, Zap, Globe, Lock, MessageCircle, Video, FileText, Layers, Share, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, handleAPIError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
// Real-time updates now handled with direct SSE connection

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, createAnonymousSession, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Real-time stats from backend
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalRooms: 0,
    messagesSent: 0,
    filesShared: 0,
    onlineUsers: 0
  });

  // Connection status for visual indicator
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  // Room joining
  const [roomCode, setRoomCode] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingRoomCode, setPendingRoomCode] = useState('');
  
  // Anonymous session creation
  const [nickname, setNickname] = useState('');
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  
  // Real-time Server-Sent Events connection for live updates
  useEffect(() => {
    console.log('🚀 Initializing real-time connection...');

    // Simple direct SSE connection with debugging
    const connectSSE = () => {
      const sseUrl = `${window.location.origin}/api/events`;
      console.log('📡 Connecting to SSE:', sseUrl);

      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully');
        setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 SSE message received:', data);

          if (data.type === 'stats_update' && data.data) {
            setStats({
              activeUsers: data.data.activeUsers || 0,
              totalRooms: data.data.totalRooms || 0,
              messagesSent: data.data.messagesSent || 0,
              filesShared: data.data.filesShared || 0,
              onlineUsers: data.data.onlineUsers || 0
            });
            setConnectionStatus('connected');
          }
        } catch (error) {
          console.error('❌ Failed to parse SSE message:', error);
          setConnectionStatus('error');
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', {
          readyState: eventSource.readyState,
          error: error
        });
        setConnectionStatus(eventSource.readyState === EventSource.CLOSED ? 'disconnected' : 'error');
      };

      return eventSource;
    };

    const eventSource = connectSSE();

    // Fallback HTTP polling in case WebSocket fails
    const loadStatsHTTP = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const statsUrl = `${apiUrl}/api/auth/stats`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(statsUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'same-origin',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.stats) {
            // Only update if SSE is not connected
            if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
              console.log('📊 Using HTTP fallback for stats:', data.stats);
              setStats({
                activeUsers: data.stats.activeUsers || 0,
                totalRooms: data.stats.totalRooms || 0,
                messagesSent: data.stats.messagesSent || 0,
                filesShared: data.stats.filesShared || 0,
                onlineUsers: data.stats.onlineUsers || 0
              });
            }
          }
        } else {
          console.warn(`⚠️ HTTP stats failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('⚠️ HTTP stats request timed out');
        } else {
          console.warn('⚠️ HTTP stats fallback failed:', error.message || error);
        }
      }
    };

    // Initial load and fallback polling
    loadStatsHTTP();
    const httpInterval = setInterval(loadStatsHTTP, 5000);

    // Cleanup
    return () => {
      clearInterval(httpInterval);
      if (eventSource) {
        console.log('🔌 Closing SSE connection');
        eventSource.close();
      }
    };
  }, []);

  // Animate numbers
  const [animatedStats, setAnimatedStats] = useState(stats);
  
  useEffect(() => {
    const animateNumber = (start: number, end: number, duration: number) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        return current;
      };
      
      const updateAnimation = () => {
        const current = animate();
        if (current < end) {
          requestAnimationFrame(updateAnimation);
        }
        return current;
      };
      
      return updateAnimation();
    };

    // Animate each stat
    const duration = 2000; // 2 seconds
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        activeUsers: animateNumber(prev.activeUsers, stats.activeUsers, duration),
        totalRooms: animateNumber(prev.totalRooms, stats.totalRooms, duration),
        messagesSent: animateNumber(prev.messagesSent, stats.messagesSent, duration),
        filesShared: animateNumber(prev.filesShared, stats.filesShared, duration),
        onlineUsers: animateNumber(prev.onlineUsers, stats.onlineUsers, duration)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [stats]);

  // Handle room code validation and joining
  const validateRoomCode = (code: string): boolean => {
    return /^[A-F0-9]{16}$/i.test(code.replace(/\s/g, ''));
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room Code Required",
        description: "Please enter a valid room code to join.",
        variant: "destructive"
      });
      return;
    }

    const cleanCode = roomCode.replace(/\s/g, '').toUpperCase();
    
    if (!validateRoomCode(cleanCode)) {
      toast({
        title: "Invalid Room Code",
        description: "Room code must be 16 hexadecimal characters.",
        variant: "destructive"
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setPendingRoomCode(cleanCode);
      setShowNicknameDialog(true);
      return;
    }

    await attemptJoinRoom(cleanCode);
  };

  const attemptJoinRoom = async (code: string, password?: string) => {
    try {
      setIsJoining(true);
      
      // First, get room info to check if password is required
      const roomInfo = await api.getRoomInfo(code);
      
      if (roomInfo.room.settings.hasPassword && !password) {
        setPendingRoomCode(code);
        setShowPasswordDialog(true);
        return;
      }

      // Join the room
      await api.joinRoom(code, password);
      
      toast({
        title: "Joining Room",
        description: "Connecting to secure chat session...",
      });
      
      // Navigate to chat
      navigate(`/chat/${roomInfo.room.roomId}`);
      
    } catch (error: any) {
      if (error.message.includes('Password required')) {
        setPendingRoomCode(code);
        setShowPasswordDialog(true);
      } else {
        handleAPIError(error, "Failed to join room");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!roomPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the room password.",
        variant: "destructive"
      });
      return;
    }

    setShowPasswordDialog(false);
    await attemptJoinRoom(pendingRoomCode, roomPassword);
    setRoomPassword('');
  };

  const handleCreateAnonymousSession = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAnonymousSession(nickname.trim(), {
        theme: 'cyber',
        autoDeleteMessages: true,
        enableNotifications: true
      });
      
      setShowNicknameDialog(false);
      
      // If there's a pending room to join, join it
      if (pendingRoomCode) {
        await attemptJoinRoom(pendingRoomCode);
        setPendingRoomCode('');
      }
      
    } catch (error) {
      // Error already handled in context
    }
  };

  const quickActions = [
    {
      title: 'Join Room',
      description: 'Enter a room code to join an existing secure chat',
      icon: Users,
      action: () => setShowNicknameDialog(!isAuthenticated),
      primary: true
    },
    {
      title: 'Create Room',
      description: 'Start a new encrypted chat room with custom settings',
      icon: Lock,
      action: () => {
        if (isAuthenticated) {
          navigate('/create');
        } else {
          setShowNicknameDialog(true);
        }
      }
    },
    {
      title: 'Share Files',
      description: 'Securely share files with end-to-end encryption',
      icon: Share,
      action: () => {
        if (isAuthenticated) {
          navigate('/files');
        } else {
          setShowNicknameDialog(true);
        }
      }
    },
    {
      title: 'Underground',
      description: 'Access advanced privacy and anonymity tools',
      icon: Globe,
      action: () => {
        if (isAuthenticated) {
          navigate('/underground');
        } else {
          setShowNicknameDialog(true);
        }
      }
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Encryption',
      description: 'AES-256 end-to-end encryption ensures your messages remain private',
      stats: '256-bit encryption'
    },
    {
      icon: Zap,
      title: 'Self-Destructing Messages',
      description: 'Messages automatically delete after customizable time periods',
      stats: '15s - 24h timers'
    },
    {
      icon: Video,
      title: 'Encrypted Video Calls',
      description: 'P2P encrypted video/audio calls with IP masking via TURN relays',
      stats: 'WebRTC P2P'
    },
    {
      icon: FileText,
      title: 'Secure File Sharing',
      description: 'Share files with encryption, download limits, and burn-after-reading',
      stats: 'Up to 100MB'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 cyber-grid opacity-30" />

        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/5475752/pexels-photo-5475752.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cybersecurity encryption background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Status Badge */}
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {animatedStats.onlineUsers} users online now
            </Badge>
            
            <h1 className="text-4xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Secure </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Anonymous
              </span>
              <span className="text-foreground"> Communication</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              End-to-end encrypted messaging with military-grade security, self-destructing messages, 
              and advanced anonymity features. No registration required.
            </p>

            {/* Quick Join Section */}
            <div className="max-w-2xl mx-auto space-y-6">
              {user ? (
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Welcome back, {user.nickname}!
                    </CardTitle>
                    <CardDescription>
                      Your secure session is active. Join a room or create a new one.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : null}
              
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="Enter room code (e.g., A1B2C3D4E5F6G7H8)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-background/50 border-border/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                      maxLength={19} // 16 chars + 3 spaces for formatting
                    />
                    <Button 
                      onClick={handleJoinRoom}
                      disabled={isJoining || isLoading}
                      className="px-8"
                      size="lg"
                    >
                      {isJoining ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Join Room
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Room codes are 16-character hexadecimal strings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border-border/50 ${
                    action.primary ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center">
                    <action.icon className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                      action.primary ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`} />
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Live Network Statistics</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected' ? 'Live Updates Active' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   connectionStatus === 'error' ? 'Connection Issues' : 'Disconnected'}
                </span>
              </div>
              <p className="text-muted-foreground">Real-time data from our secure infrastructure</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {animatedStats.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
                <div className="h-1 bg-primary/20 rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full w-3/4 transition-all duration-1000" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">
                  {animatedStats.totalRooms.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Active Rooms</div>
                <div className="h-1 bg-accent/20 rounded-full mt-2">
                  <div className="h-full bg-accent rounded-full w-2/3 transition-all duration-1000" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-500 mb-2">
                  {animatedStats.messagesSent.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Messages Today</div>
                <div className="h-1 bg-green-500/20 rounded-full mt-2">
                  <div className="h-full bg-green-500 rounded-full w-5/6 transition-all duration-1000" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-500 mb-2">
                  {animatedStats.filesShared.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Files Shared</div>
                <div className="h-1 bg-blue-500/20 rounded-full mt-2">
                  <div className="h-full bg-blue-500 rounded-full w-1/2 transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Matrix code background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Enterprise-Grade Security Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built with the latest cryptographic standards and privacy-preserving technologies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                // Feature images for visual enhancement
                const featureImages = [
                  "https://images.pexels.com/photos/5475786/pexels-photo-5475786.jpeg?auto=compress&cs=tinysrgb&w=800", // Military-Grade Encryption
                  "https://images.pexels.com/photos/9783812/pexels-photo-9783812.jpeg?auto=compress&cs=tinysrgb&w=800", // Self-Destructing Messages
                  "https://images.pexels.com/photos/24347621/pexels-photo-24347621.jpeg?auto=compress&cs=tinysrgb&w=800", // Encrypted Video Calls
                  "https://images.pexels.com/photos/8371715/pexels-photo-8371715.jpeg?auto=compress&cs=tinysrgb&w=800" // Secure File Sharing
                ];

                return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
                  {/* Feature Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={featureImages[index]}
                      alt={`${feature.title} illustration`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-lg">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {feature.stats}
                    </Badge>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        {/* CTA Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/9783812/pexels-photo-9783812.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Secure communication background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Start Secure Communication?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who trust SecureChat for their private communications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={() => isAuthenticated ? navigate('/create') : setShowNicknameDialog(true)}
              >
                <Lock className="h-5 w-5 mr-2" />
                Create Secure Room
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8"
                onClick={() => navigate('/features')}
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nickname Dialog */}
      <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Anonymous Session</DialogTitle>
            <DialogDescription>
              Choose a nickname to start your secure, anonymous session. No personal information required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateAnonymousSession()}
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              Your nickname is only used for this session and is not stored permanently.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateAnonymousSession}
                disabled={!nickname.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Start Session
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNicknameDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Password Required</DialogTitle>
            <DialogDescription>
              This room requires a password to join. Enter the password provided by the room creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter room password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePasswordSubmit}
                disabled={!roomPassword.trim() || isJoining}
                className="flex-1"
              >
                {isJoining ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Join Room
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setRoomPassword('');
                  setPendingRoomCode('');
                }}
                disabled={isJoining}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
