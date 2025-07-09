import { useState } from 'react';
import { Lock, Shield, ArrowRight, QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room Code Required",
        description: "Please enter a valid room code to join.",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    
    // Simulate room validation
    setTimeout(() => {
      setIsJoining(false);
      toast({
        title: "Joining Secure Room",
        description: "Connecting to encrypted chat session...",
      });
      
      // Navigate to chat with room code
      navigate(`/chat/${roomCode}`);
    }, 1500);
  };

  const handlePasteFromClipboard = async () => {
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

  const sampleRoomCodes = [
    { code: "SecureDemo2024", description: "Public demo room", users: 3 },
    { code: "TestRoom123", description: "Test environment", users: 1 },
    { code: "PrivacyFirst", description: "Privacy discussion", users: 7 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🔐 Secure Room Access
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-foreground">Join </span>
              <span className="gradient-neon bg-clip-text text-transparent">Anonymous</span>
              <span className="text-foreground"> Chat</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Enter a room code to join an existing secure chat session. 
              Your identity remains completely anonymous.
            </p>
          </div>
        </div>
      </section>

      {/* Join Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animated-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  Enter Room Code
                </CardTitle>
                <CardDescription className="text-base">
                  Paste or type the secure room code you received
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Code Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Room Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste room code here..."
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="flex-1 bg-background/50 border-border focus:border-primary font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handlePasteFromClipboard}
                      className="px-3"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Room codes are case-sensitive and contain 8-32 characters
                  </p>
                </div>

                {/* Optional Password */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Password (if required)</label>
                  <Input
                    type="password"
                    placeholder="Enter room password if set..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if the room doesn't require a password
                  </p>
                </div>

                {/* Join Button */}
                <Button 
                  onClick={handleJoinRoom} 
                  variant="cyber" 
                  className="w-full" 
                  size="lg"
                  disabled={!roomCode.trim() || isJoining}
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Joining Room...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Join Secure Room
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button variant="neon" className="w-full" size="lg" asChild>
                  <Link to="/create">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Create New Room
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Code Option */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6 text-accent" />
                  Alternative Join Methods
                </CardTitle>
                <CardDescription>
                  Other ways to join secure chat rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">QR Code Scanning</h3>
                    <p className="text-muted-foreground">
                      Scan a QR code shared by the room creator for instant access. 
                      The QR code contains the encrypted room information.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      <QrCode className="mr-2 h-4 w-4" />
                      Scan QR Code (Coming Soon)
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Direct Links</h3>
                    <p className="text-muted-foreground">
                      Click a direct link shared by someone to automatically 
                      join their secure chat room.
                    </p>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Example: securechat.app/room/abc123xyz
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Rooms */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-foreground">Try </span>
                <span className="gradient-neon bg-clip-text text-transparent">Demo Rooms</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Test SecureChat features in public demo rooms
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {sampleRoomCodes.map((room, index) => (
                <Card key={index} className="group bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer" onClick={() => setRoomCode(room.code)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.code}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {room.users} users
                      </Badge>
                    </div>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                      Use This Code
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Demo rooms are public and may contain test messages from other users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Your Privacy is Protected</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">🔒 Encrypted Entry</p>
                    <p>All room access is encrypted and anonymous</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">🌐 IP Masked</p>
                    <p>Your real IP address is never exposed</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">🚫 No Logs</p>
                    <p>No record of your room access is stored</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinRoom;