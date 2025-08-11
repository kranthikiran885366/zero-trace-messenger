import { useState, useEffect } from 'react';
import { Copy, Shield, Timer, Key, Link2, QrCode, Users, Download, Share2, Settings, Eye, EyeOff, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { encryption } from '@/lib/encryption';
import { useNavigate } from 'react-router-dom';

const RoomCreator = () => {
  const [roomSettings, setRoomSettings] = useState({
    password: '',
    autoDestroy: '3600000', // 1 hour default
    maxUsers: '10',
    enableVideo: true,
    enableFileSharing: true,
    enableScreenShare: true,
    allowAnonymousJoin: true,
    messageRetention: '86400000', // 24 hours
    roomDescription: '',
    maxFileSize: '50', // MB
    enableVoiceNotes: true,
    enableDrawing: false,
    roomTheme: 'cyber'
  });
  
  const [generatedRoom, setGeneratedRoom] = useState<{
    code: string;
    link: string;
    encryptionKey: string;
    roomId: string;
    qrCode?: string;
    expiresAt: number;
  } | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);

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
    { value: '50', label: '50 users' },
    { value: '100', label: '100 users' },
  ];

  const fileSizeOptions = [
    { value: '10', label: '10 MB' },
    { value: '25', label: '25 MB' },
    { value: '50', label: '50 MB' },
    { value: '100', label: '100 MB' },
    { value: '250', label: '250 MB' },
  ];

  const themeOptions = [
    { value: 'cyber', label: 'Cyber (Default)' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'light', label: 'Light Mode' },
    { value: 'matrix', label: 'Matrix Green' },
  ];

  const navigate = useNavigate();

  const generateRoom = async () => {
    setIsGenerating(true);

    try {
      // Generate secure room credentials
      const roomId = encryption.generateRoomId();
      const encryptionKey = encryption.generateRoomKey();
      const roomCode = encryption.generateRoomId() + encryption.generateRoomId().slice(0, 8); // 24 char code

      // Calculate expiration time
      const expiresAt = roomSettings.autoDestroy === 'manual'
        ? Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year for manual
        : Date.now() + parseInt(roomSettings.autoDestroy);

      const roomLink = `${window.location.origin}/chat/${roomCode}`;

      // Simulate room creation API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGeneratedRoom({
        code: roomCode,
        link: roomLink,
        encryptionKey,
        roomId,
        expiresAt,
      });

      toast({
        title: "🔐 Secure Room Created Successfully!",
        description: `Room ${roomCode} is ready for secure communication.`,
      });
    } catch (error) {
      toast({
        title: "Room Creation Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
      {/* Back Button Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="bg-primary/10 border-primary/50 hover:bg-primary/20 hover:border-primary/70 text-primary transition-all duration-300 shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            BACK TO HOME
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/features')}
            className="bg-accent/10 border-accent/50 hover:bg-accent/20 hover:border-accent/70 text-accent transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <Shield className="h-5 w-5 mr-2" />
            VIEW FEATURES
          </Button>
        </div>
      </div>
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave empty for no password"
                      value={roomSettings.password}
                      onChange={(e) => setRoomSettings(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security with a password
                  </p>
                </div>

                {/* Room Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Description (Optional)</label>
                  <Textarea
                    placeholder="Brief description of this room's purpose..."
                    value={roomSettings.roomDescription}
                    onChange={(e) => setRoomSettings(prev => ({ ...prev, roomDescription: e.target.value }))}
                    className="bg-background/50 resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Help participants understand the room's purpose
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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Screen Sharing</p>
                      <p className="text-xs text-muted-foreground">Allow participants to share screens</p>
                    </div>
                    <Switch
                      checked={roomSettings.enableScreenShare}
                      onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, enableScreenShare: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Anonymous Join</p>
                      <p className="text-xs text-muted-foreground">Allow joining without nicknames</p>
                    </div>
                    <Switch
                      checked={roomSettings.allowAnonymousJoin}
                      onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, allowAnonymousJoin: checked }))}
                    />
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={() => setAdvancedSettings(!advancedSettings)}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Advanced Settings
                    </span>
                    <span className="text-xs">{advancedSettings ? 'Hide' : 'Show'}</span>
                  </Button>
                </div>

                {/* Advanced Settings */}
                {advancedSettings && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    {/* Max File Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max File Size</label>
                      <Select
                        value={roomSettings.maxFileSize}
                        onValueChange={(value) => setRoomSettings(prev => ({ ...prev, maxFileSize: value }))}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fileSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Room Theme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room Theme</label>
                      <Select
                        value={roomSettings.roomTheme}
                        onValueChange={(value) => setRoomSettings(prev => ({ ...prev, roomTheme: value }))}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Features */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Voice Notes</p>
                          <p className="text-xs text-muted-foreground">Record and send voice messages</p>
                        </div>
                        <Switch
                          checked={roomSettings.enableVoiceNotes}
                          onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, enableVoiceNotes: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Drawing Board</p>
                          <p className="text-xs text-muted-foreground">Collaborative drawing canvas</p>
                        </div>
                        <Switch
                          checked={roomSettings.enableDrawing}
                          onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, enableDrawing: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  <Button
                    onClick={generateRoom}
                    variant="cyber"
                    className="w-full"
                    size="lg"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Create Secure Room
                      </>
                    )}
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

              {/* Encryption Info */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Encryption Fingerprint
                </label>
                <div className="flex gap-2">
                  <Input
                    value={encryption.generateFingerprint(generatedRoom.encryptionKey)}
                    readOnly
                    className="font-mono text-sm bg-accent/5 border-accent/20"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(encryption.generateFingerprint(generatedRoom.encryptionKey), 'Fingerprint')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this fingerprint to verify secure connections
                </p>
              </div>

              {/* Room Settings Summary */}
              <div className="grid lg:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Security:</p>
                  <div className="space-y-1">
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      {autoDestroyOptions.find(opt => opt.value === roomSettings.autoDestroy)?.label}
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      Max {roomSettings.maxUsers} users
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
                  <p className="text-sm font-medium">Communication:</p>
                  <div className="space-y-1">
                    {roomSettings.enableVideo && (
                      <Badge variant="secondary">Video calls</Badge>
                    )}
                    {roomSettings.enableFileSharing && (
                      <Badge variant="secondary">File sharing</Badge>
                    )}
                    {roomSettings.enableScreenShare && (
                      <Badge variant="secondary">Screen share</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Advanced:</p>
                  <div className="space-y-1">
                    {roomSettings.enableVoiceNotes && (
                      <Badge variant="secondary">Voice notes</Badge>
                    )}
                    {roomSettings.enableDrawing && (
                      <Badge variant="secondary">Drawing board</Badge>
                    )}
                    <Badge variant="secondary">
                      Max {roomSettings.maxFileSize}MB files
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="cyber" onClick={() => navigate(`/chat/${generatedRoom.code}`)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Enter Room
                  </Button>
                  <Button variant="neon" onClick={() => navigate(`/video/${generatedRoom.code}`)}>
                    <Users className="mr-2 h-4 w-4" />
                    Video Call
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedRoom.code, 'Room Code')}>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedRoom.link, 'Link')}>
                    <Share2 className="mr-1 h-3 w-3" />
                    Share Link
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <QrCode className="mr-1 h-3 w-3" />
                    QR Code
                  </Button>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={resetRoom} className="flex-1">
                    Create Another Room
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const roomData = {
                      code: generatedRoom.code,
                      link: generatedRoom.link,
                      settings: roomSettings,
                      created: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(roomData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `room-${generatedRoom.code}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Details
                  </Button>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground space-y-1">
                <p>🔒 AES-256 encryption • 🌐 IP masking via Tor • 🚫 Zero logging policy</p>
                <p>Expires: {new Date(generatedRoom.expiresAt).toLocaleString()}</p>
                <p className="text-primary">Room ID: {generatedRoom.roomId} • Fingerprint: {encryption.generateFingerprint(generatedRoom.encryptionKey)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoomCreator;
