import { useState, useEffect } from 'react';
import { Shield, MessageSquare, Timer, Eye, EyeOff, Video, Lock, Zap, Globe, ArrowRight, Users, FileShare, Settings, Activity, Phone, Camera, Mic, Share2, Copy, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { encryption } from '@/lib/encryption';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [roomCode, setRoomCode] = useState('');
  const [stealthMode, setStealthMode] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const [liveStats, setLiveStats] = useState({
    activeRooms: 147,
    onlineUsers: 892,
    messagesExchanged: 15234,
    dataDestroyed: 99.8
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "IP Masking",
      description: "Your real IP is never exposed with Tor/VPN routing",
      action: () => navigate('/how-it-works'),
      interactive: true
    },
    {
      icon: Timer,
      title: "Self-Destruct Messages",
      description: "Messages disappear in 15s, 1m, 5m, 15m, or on read",
      action: () => navigate('/features'),
      interactive: true
    },
    {
      icon: Video,
      title: "Encrypted Video Calls",
      description: "P2P encrypted calls with complete anonymity",
      action: () => navigate('/create'),
      interactive: true
    },
    {
      icon: Lock,
      title: "No Trace Logging",
      description: "Zero data storage, no metadata, no tracking",
      action: () => navigate('/faq'),
      interactive: true
    },
    {
      icon: Zap,
      title: "Anonymous Login",
      description: "No email, phone, or personal data required",
      action: () => navigate('/auth'),
      interactive: true
    },
    {
      icon: Globe,
      title: "Stealth Mode",
      description: "App disguised as calculator or note-taking tool",
      action: () => {
        setStealthMode(true);
        toast({
          title: "🕵️ Stealth Mode Activated",
          description: "App is now disguised as a calculator",
        });
      },
      interactive: true
    }
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      title: "Start Chat",
      description: "Create a new secure room",
      color: "bg-primary/10 text-primary border-primary/20",
      action: () => navigate('/create')
    },
    {
      icon: Users,
      title: "Join Room",
      description: "Enter an existing room",
      color: "bg-accent/10 text-accent border-accent/20",
      action: () => navigate('/join')
    },
    {
      icon: FileShare,
      title: "Share Files",
      description: "Secure file transfer",
      color: "bg-neon-green/10 text-neon-green border-neon-green/20",
      action: () => navigate('/files')
    },
    {
      icon: Phone,
      title: "Video Call",
      description: "Encrypted video chat",
      color: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
      action: () => navigate('/create')
    }
  ];

  // Live stats simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeRooms: prev.activeRooms + Math.floor(Math.random() * 3) - 1,
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10) - 5,
        messagesExchanged: prev.messagesExchanged + Math.floor(Math.random() * 20),
        dataDestroyed: Math.min(99.9, prev.dataDestroyed + 0.001)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    setIsJoining(true);
    
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (encryption.validateRoomCode(roomCode)) {
      toast({
        title: "🔐 Joining Secure Room",
        description: `Connecting to room ${roomCode}...`,
      });
      navigate(`/chat/${roomCode}`);
    } else {
      toast({
        title: "Invalid Room Code",
        description: "Please check the room code and try again.",
        variant: "destructive"
      });
    }
    setIsJoining(false);
  };

  const handleCalculatorClick = (value: string) => {
    if (value === '=') {
      if (calculatorInput === '888+888' || calculatorInput === '1776') {
        setStealthMode(false);
        setCalculatorInput('');
        toast({
          title: "🔓 Stealth Mode Deactivated",
          description: "Welcome back to SecureChat",
        });
      } else {
        try {
          const result = eval(calculatorInput);
          setCalculatorInput(result.toString());
        } catch {
          setCalculatorInput('Error');
        }
      }
    } else if (value === 'C') {
      setCalculatorInput('');
    } else {
      setCalculatorInput(prev => prev + value);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRoomCode(text.trim());
        toast({
          title: "Room Code Pasted",
          description: "Room code has been pasted from clipboard.",
        });
      }
    } catch (err) {
      toast({
        title: "Clipboard Access Failed",
        description: "Please paste the room code manually.",
        variant: "destructive"
      });
    }
  };

  if (stealthMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <div className="bg-gray-50 p-3 rounded text-right text-xl font-mono border">
              {calculatorInput || '0'}
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Calculator</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              'C', '±', '%', '÷',
              '7', '8', '9', '×',
              '4', '5', '6', '-',
              '1', '2', '3', '+',
              '0', '.', '=', ''
            ].map((btn, index) => {
              if (btn === '') return <div key={index}></div>;
              return (
                <button 
                  key={btn}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded text-lg font-semibold transition-colors"
                  onClick={() => handleCalculatorClick(btn)}
                >
                  {btn}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
            <p>Scientific Calculator v2.1</p>
            <p className="text-green-600">Enter 888+888 or 1776 then = to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark opacity-90" />
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  🔐 Ultra-Secure Anonymous Chat
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-neon bg-clip-text text-transparent">
                    Secure Chat
                  </span>
                  <br />
                  <span className="text-foreground">No Trace, No Limits</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  End-to-end encrypted messaging with IP masking, self-destructing messages, 
                  and complete anonymity. Your conversations leave no digital footprint.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="cyber" 
                  className="text-lg px-8 py-6 animate-neon-pulse"
                  onClick={() => navigate('/create')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Anonymous Chat
                </Button>
                <Button 
                  size="lg" 
                  variant="neon" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/how-it-works')}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  How It Works
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <span>No Registration Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Military-Grade Encryption</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-glow-pulse" />
              <img 
                src={heroImage} 
                alt="Secure Chat Interface" 
                className="relative rounded-3xl shadow-2xl cyber-shadow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-8 bg-card/30 backdrop-blur-sm border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary animate-pulse">
                {liveStats.activeRooms}
              </div>
              <div className="text-sm text-muted-foreground">Active Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-accent animate-pulse">
                {liveStats.onlineUsers}
              </div>
              <div className="text-sm text-muted-foreground">Online Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-neon-green">
                {liveStats.messagesExchanged.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-neon-purple">
                {liveStats.dataDestroyed}%
              </div>
              <div className="text-sm text-muted-foreground">Data Destroyed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Quick </span>
              <span className="gradient-neon bg-clip-text text-transparent">Actions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started with secure communication in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className={`group cursor-pointer hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm hover:scale-105 ${action.color}`}
                onClick={action.action}
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <action.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                  <Button variant="ghost" size="sm" className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Join Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="animated-border bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Quick Access
                </CardTitle>
                <CardDescription>
                  Join an existing room or create a new anonymous chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Enter Room Code
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Paste room code here..."
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        className="bg-background/50 border-border focus:border-primary flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={pasteFromClipboard}
                        className="px-3"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="cyber" 
                    className="w-full" 
                    disabled={!roomCode.trim() || isJoining}
                    onClick={handleJoinRoom}
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Join Secure Room
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  variant="neon" 
                  className="w-full"
                  onClick={() => navigate('/create')}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Create New Anonymous Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Ultimate Privacy</span>{' '}
              <span className="gradient-neon bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced security features designed for maximum anonymity and zero digital footprint
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm animated-border ${
                  feature.interactive ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={feature.action}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    {feature.interactive && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  {feature.interactive && (
                    <Button variant="ghost" size="sm" className="mt-3 group-hover:bg-primary/10 transition-colors">
                      Learn More
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stealth Mode Toggle */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {stealthMode ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      Stealth Mode
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Disguise the app as a simple calculator to avoid detection
                    </CardDescription>
                  </div>
                  <Button 
                    variant={stealthMode ? "destructive" : "default"}
                    onClick={() => {
                      setStealthMode(!stealthMode);
                      toast({
                        title: stealthMode ? "🔓 Stealth Mode Disabled" : "🕵️ Stealth Mode Enabled",
                        description: stealthMode ? "Back to normal view" : "App disguised as calculator",
                      });
                    }}
                    className="px-6"
                  >
                    {stealthMode ? "Disable" : "Enable"} Stealth
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2024 SecureChat. No logs, no trace, no compromises.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
