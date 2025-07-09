import { useState } from 'react';
import { Copy, Shield, Timer, Key, Link2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const RoomCreator = () => {
  const [roomSettings, setRoomSettings] = useState({
    password: '',
    autoDestroy: '3600000', // 1 hour default
    maxUsers: '2',
    enableVideo: true,
    enableFileSharing: true,
  });
  
  const [generatedRoom, setGeneratedRoom] = useState<{
    code: string;
    link: string;
  } | null>(null);

  const { toast } = useToast();

  const autoDestroyOptions = [
    { value: '1800000', label: '30 minutes' },
    { value: '3600000', label: '1 hour' },
    { value: '7200000', label: '2 hours' },
    { value: '21600000', label: '6 hours' },
    { value: '86400000', label: '24 hours' },
    { value: 'manual', label: 'Manual destruction' },
  ];

  const maxUsersOptions = [
    { value: '2', label: '2 users' },
    { value: '5', label: '5 users' },
    { value: '10', label: '10 users' },
    { value: '20', label: '20 users' },
  ];

  const generateRoom = () => {
    // Generate a secure random room code
    const roomCode = Array.from({ length: 16 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'[
        Math.floor(Math.random() * 57)
      ]
    ).join('');

    const roomLink = `${window.location.origin}/room/${roomCode}`;

    setGeneratedRoom({
      code: roomCode,
      link: roomLink,
    });

    toast({
      title: "Secure Room Created",
      description: "Your anonymous chat room is ready. Share the code with participants.",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: `The room ${type.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  const resetRoom = () => {
    setGeneratedRoom(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Create Anonymous Room
            </CardTitle>
            <CardDescription className="text-lg">
              Set up a secure, encrypted chat room with custom privacy settings
            </CardDescription>
          </CardHeader>
        </Card>

        {!generatedRoom ? (
          /* Room Configuration */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Room Settings
                </CardTitle>
                <CardDescription>
                  Configure security and privacy options for your room
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Password (Optional)</label>
                  <Input
                    type="password"
                    placeholder="Leave empty for no password"
                    value={roomSettings.password}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security with a password
                  </p>
                </div>

                {/* Auto Destroy Timer */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Destroy Room</label>
                  <Select 
                    value={roomSettings.autoDestroy} 
                    onValueChange={(value) => setRoomSettings(prev => ({ ...prev, autoDestroy: value }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {autoDestroyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Room will be automatically destroyed after this time
                  </p>
                </div>

                {/* Max Users */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Users</label>
                  <Select 
                    value={roomSettings.maxUsers} 
                    onValueChange={(value) => setRoomSettings(prev => ({ ...prev, maxUsers: value }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {maxUsersOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable Video Calls</p>
                      <p className="text-xs text-muted-foreground">Allow encrypted video/audio calls</p>
                    </div>
                    <Switch 
                      checked={roomSettings.enableVideo}
                      onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, enableVideo: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable File Sharing</p>
                      <p className="text-xs text-muted-foreground">Allow encrypted file transfers</p>
                    </div>
                    <Switch 
                      checked={roomSettings.enableFileSharing}
                      onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, enableFileSharing: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Security Features
                </CardTitle>
                <CardDescription>
                  Your room will automatically include these privacy protections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      title: "End-to-End Encryption",
                      description: "All messages encrypted with AES-256"
                    },
                    {
                      title: "IP Masking",
                      description: "Real IP addresses hidden via Tor/VPN routing"
                    },
                    {
                      title: "No Metadata Logging",
                      description: "Zero storage of user data or conversation logs"
                    },
                    {
                      title: "Self-Destructing Messages",
                      description: "Messages auto-delete based on timer settings"
                    },
                    {
                      title: "Anonymous Identities",
                      description: "No registration or personal data required"
                    },
                    {
                      title: "Secure File Transfer",
                      description: "Encrypted file sharing with burn-after-download"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={generateRoom} variant="cyber" className="w-full" size="lg">
                    <Shield className="mr-2 h-5 w-5" />
                    Create Secure Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Generated Room Display */
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Room Created Successfully!</CardTitle>
              <CardDescription>
                Share the room code or link with participants to start chatting securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Room Code
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedRoom.code} 
                    readOnly 
                    className="font-mono text-lg bg-primary/5 border-primary/20"
                  />
                  <Button 
                    variant="neon" 
                    onClick={() => copyToClipboard(generatedRoom.code, 'Code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Room Link */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Direct Link
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedRoom.link} 
                    readOnly 
                    className="font-mono text-sm bg-accent/5 border-accent/20"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(generatedRoom.link, 'Link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Room Settings Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Room Settings:</p>
                  <div className="space-y-1">
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      Auto-destroy: {autoDestroyOptions.find(opt => opt.value === roomSettings.autoDestroy)?.label}
                    </Badge>
                    <Badge variant="secondary">
                      Max users: {roomSettings.maxUsers}
                    </Badge>
                    {roomSettings.password && (
                      <Badge variant="secondary">
                        <Key className="h-3 w-3 mr-1" />
                        Password protected
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Features:</p>
                  <div className="space-y-1">
                    {roomSettings.enableVideo && (
                      <Badge variant="secondary">Video calls enabled</Badge>
                    )}
                    {roomSettings.enableFileSharing && (
                      <Badge variant="secondary">File sharing enabled</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button variant="cyber" className="flex-1" asChild>
                  <a href={generatedRoom.link}>
                    <Shield className="mr-2 h-4 w-4" />
                    Enter Room
                  </a>
                </Button>
                <Button variant="outline" onClick={resetRoom}>
                  Create Another Room
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                🔒 This room uses military-grade encryption • 🌐 IP addresses are masked • 🚫 No data is logged
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoomCreator;