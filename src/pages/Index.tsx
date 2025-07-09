import { useState } from 'react';
import { Shield, MessageSquare, Timer, Eye, EyeOff, Video, Lock, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [roomCode, setRoomCode] = useState('');
  const [stealthMode, setStealthMode] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "IP Masking",
      description: "Your real IP is never exposed with Tor/VPN routing"
    },
    {
      icon: Timer,
      title: "Self-Destruct Messages",
      description: "Messages disappear in 15s, 1m, 5m, 15m, or on read"
    },
    {
      icon: Video,
      title: "Encrypted Video Calls",
      description: "P2P encrypted calls with complete anonymity"
    },
    {
      icon: Lock,
      title: "No Trace Logging",
      description: "Zero data storage, no metadata, no tracking"
    },
    {
      icon: Zap,
      title: "Anonymous Login",
      description: "No email, phone, or personal data required"
    },
    {
      icon: Globe,
      title: "Stealth Mode",
      description: "App disguised as calculator or note-taking tool"
    }
  ];

  if (stealthMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Simple Calculator</h2>
          <div className="grid grid-cols-4 gap-2">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
              <button 
                key={btn}
                className="p-4 bg-gray-200 hover:bg-gray-300 rounded text-lg font-semibold"
                onClick={() => btn === '888' && setStealthMode(false)}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Type 888+888 to access secure chat
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Anonymous Chat
                </Button>
                <Button 
                  size="lg" 
                  variant="neon" 
                  className="text-lg px-8 py-6"
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
                    <Input 
                      placeholder="Paste room code here..."
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                  <Button variant="cyber" className="w-full" disabled={!roomCode.trim()}>
                    <Lock className="mr-2 h-4 w-4" />
                    Join Secure Room
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

                <Button variant="neon" className="w-full">
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
                className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm animated-border"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
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
                    onClick={() => setStealthMode(!stealthMode)}
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
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
