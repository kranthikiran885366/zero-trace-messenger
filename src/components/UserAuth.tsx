import { useState, useEffect } from 'react';
import { User, Shield, Eye, EyeOff, Key, Fingerprint, Settings, LogOut, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { encryption } from '@/lib/encryption';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UserSession {
  id: string;
  nickname: string;
  fingerprint: string;
  createdAt: number;
  lastActive: number;
  theme: string;
  preferences: {
    autoDeleteMessages: boolean;
    enableNotifications: boolean;
    showTypingIndicators: boolean;
    autoJoinVideo: boolean;
    defaultMessageTimer: string;
    preferredQuality: string;
  };
  stats: {
    roomsJoined: number;
    messagesExchanged: number;
    filesShared: number;
    callMinutes: number;
  };
}

interface AuthContextType {
  session: UserSession | null;
  createSession: (nickname: string) => void;
  updateSession: (updates: Partial<UserSession>) => void;
  clearSession: () => void;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // Load session from localStorage
    const savedSession = localStorage.getItem('anon_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('anon_session');
      }
    }
  }, []);

  const createSession = (nickname: string) => {
    const newSession: UserSession = {
      id: 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
      nickname,
      fingerprint: encryption.generateFingerprint(nickname + Date.now()),
      createdAt: Date.now(),
      lastActive: Date.now(),
      theme: 'cyber',
      preferences: {
        autoDeleteMessages: true,
        enableNotifications: false,
        showTypingIndicators: true,
        autoJoinVideo: false,
        defaultMessageTimer: '300000',
        preferredQuality: '720p'
      },
      stats: {
        roomsJoined: 0,
        messagesExchanged: 0,
        filesShared: 0,
        callMinutes: 0
      }
    };
    
    setSession(newSession);
    localStorage.setItem('anon_session', JSON.stringify(newSession));
  };

  const updateSession = (updates: Partial<UserSession>) => {
    if (!session) return;
    
    const updatedSession = { 
      ...session, 
      ...updates, 
      lastActive: Date.now() 
    };
    
    setSession(updatedSession);
    localStorage.setItem('anon_session', JSON.stringify(updatedSession));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem('anon_session');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        createSession, 
        updateSession, 
        clearSession, 
        isAnonymous: true 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const UserAuth = () => {
  const { session, createSession, updateSession, clearSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingSession, setIsCreatingSession] = useState(!session);
  const [nickname, setNickname] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateSession = () => {
    if (!nickname.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname to create your anonymous session.",
        variant: "destructive"
      });
      return;
    }

    createSession(nickname.trim());
    setIsCreatingSession(false);
    toast({
      title: "Anonymous Session Created",
      description: `Welcome, ${nickname}! Your session is now active.`,
    });
  };

  const updatePreference = (key: keyof UserSession['preferences'], value: any) => {
    if (!session) return;
    updateSession({
      preferences: {
        ...session.preferences,
        [key]: value
      }
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (isCreatingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Anonymous Session
            </CardTitle>
            <p className="text-muted-foreground">
              Create a temporary identity for secure communication
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose a Nickname</label>
              <Input
                placeholder="Enter your anonymous nickname..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                This nickname is temporary and not linked to any personal data
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Privacy Features</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• No registration or personal data required</li>
                  <li>• Session data stored locally only</li>
                  <li>• Automatic session expiry for security</li>
                  <li>• All communications are encrypted</li>
                </ul>
              </div>

              <Button onClick={handleCreateSession} variant="cyber" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Create Anonymous Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

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
            onClick={() => navigate('/create')}
            className="bg-accent/10 border-accent/50 hover:bg-accent/20 hover:border-accent/70 text-accent transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <Shield className="h-5 w-5 mr-2" />
            CREATE ROOM
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  Anonymous Session
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  Managing session for {session.nickname}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="destructive" onClick={clearSession}>
                  <LogOut className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-accent" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nickname</label>
                    <p className="font-semibold">{session.nickname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                    <p className="font-mono text-sm">{session.id.slice(-12)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fingerprint</label>
                    <p className="font-mono text-sm">{session.fingerprint}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{new Date(session.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Session Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{session.stats.roomsJoined}</p>
                      <p className="text-sm text-muted-foreground">Rooms Joined</p>
                    </div>
                    <div className="text-center p-3 bg-accent/5 rounded-lg">
                      <p className="text-2xl font-bold text-accent">{session.stats.messagesExchanged}</p>
                      <p className="text-sm text-muted-foreground">Messages Exchanged</p>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{session.stats.filesShared}</p>
                      <p className="text-sm text-muted-foreground">Files Shared</p>
                    </div>
                    <div className="text-center p-3 bg-accent/5 rounded-lg">
                      <p className="text-2xl font-bold text-accent">{formatDuration(session.stats.callMinutes)}</p>
                      <p className="text-sm text-muted-foreground">Call Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <a href="/create">
                      <Shield className="h-6 w-6" />
                      <span>Create Room</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <a href="/join">
                      <Key className="h-6 w-6" />
                      <span>Join Room</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <a href="/files">
                      <User className="h-6 w-6" />
                      <span>Share Files</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <a href="/manage">
                      <Settings className="h-6 w-6" />
                      <span>Manage Rooms</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {showSettings && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-delete Messages</p>
                        <p className="text-xs text-muted-foreground">Automatically delete messages after timer</p>
                      </div>
                      <Switch 
                        checked={session.preferences.autoDeleteMessages}
                        onCheckedChange={(checked) => updatePreference('autoDeleteMessages', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show Typing Indicators</p>
                        <p className="text-xs text-muted-foreground">Let others know when you're typing</p>
                      </div>
                      <Switch 
                        checked={session.preferences.showTypingIndicators}
                        onCheckedChange={(checked) => updatePreference('showTypingIndicators', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-join Video</p>
                        <p className="text-xs text-muted-foreground">Automatically start video when joining calls</p>
                      </div>
                      <Switch 
                        checked={session.preferences.autoJoinVideo}
                        onCheckedChange={(checked) => updatePreference('autoJoinVideo', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Message Timer</label>
                    <Select 
                      value={session.preferences.defaultMessageTimer} 
                      onValueChange={(value) => updatePreference('defaultMessageTimer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60000">1 minute</SelectItem>
                        <SelectItem value="300000">5 minutes</SelectItem>
                        <SelectItem value="900000">15 minutes</SelectItem>
                        <SelectItem value="3600000">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Quality</label>
                    <Select 
                      value={session.preferences.preferredQuality} 
                      onValueChange={(value) => updatePreference('preferredQuality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480p (Low)</SelectItem>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Notice */}
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-bold mb-2">Privacy Protected</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Session data stored locally only</p>
                  <p>• No server-side user tracking</p>
                  <p>• Automatic session cleanup</p>
                  <p>• End-to-end encryption</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
