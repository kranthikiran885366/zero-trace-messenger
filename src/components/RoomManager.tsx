import { useState, useEffect } from 'react';
import { Shield, Users, Clock, Settings, Trash2, Eye, EyeOff, Copy, AlertTriangle, Activity, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { encryption } from '@/lib/encryption';

interface RoomInfo {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  userCount: number;
  maxUsers: number;
  hasPassword: boolean;
  enableVideo: boolean;
  enableFileSharing: boolean;
  enableScreenShare: boolean;
  messageCount: number;
  lastActivity: number;
  encryptionFingerprint: string;
  settings: {
    autoDestroy: number;
    messageRetention: number;
    maxFileSize: number;
    allowAnonymousJoin: boolean;
    enableVoiceNotes: boolean;
    enableDrawing: boolean;
    roomTheme: string;
  };
}

interface SecurityLog {
  id: string;
  timestamp: number;
  type: 'join' | 'leave' | 'message' | 'file_share' | 'video_start' | 'security_alert';
  userId: string;
  description: string;
  metadata?: any;
}

const RoomManager = () => {
  const { toast } = useToast();
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    // Load demo rooms
    const demoRooms: RoomInfo[] = [
      {
        id: '1',
        code: 'SecureDemo2024',
        name: 'Demo Room',
        description: 'Public demo room for testing',
        createdAt: Date.now() - 3600000, // 1 hour ago
        expiresAt: Date.now() + 7200000, // 2 hours from now
        isActive: true,
        userCount: 3,
        maxUsers: 10,
        hasPassword: false,
        enableVideo: true,
        enableFileSharing: true,
        enableScreenShare: true,
        messageCount: 47,
        lastActivity: Date.now() - 300000, // 5 minutes ago
        encryptionFingerprint: encryption.generateFingerprint('demo_key_123'),
        settings: {
          autoDestroy: 3600000,
          messageRetention: 86400000,
          maxFileSize: 50,
          allowAnonymousJoin: true,
          enableVoiceNotes: true,
          enableDrawing: false,
          roomTheme: 'cyber'
        }
      },
      {
        id: '2',
        code: 'PrivateTeam456',
        name: 'Team Discussion',
        description: 'Private team room',
        createdAt: Date.now() - 7200000, // 2 hours ago
        expiresAt: Date.now() + 21600000, // 6 hours from now
        isActive: false,
        userCount: 0,
        maxUsers: 5,
        hasPassword: true,
        enableVideo: true,
        enableFileSharing: true,
        enableScreenShare: false,
        messageCount: 23,
        lastActivity: Date.now() - 1800000, // 30 minutes ago
        encryptionFingerprint: encryption.generateFingerprint('team_key_456'),
        settings: {
          autoDestroy: 86400000,
          messageRetention: 604800000,
          maxFileSize: 100,
          allowAnonymousJoin: false,
          enableVoiceNotes: true,
          enableDrawing: true,
          roomTheme: 'dark'
        }
      }
    ];
    
    setActiveRooms(demoRooms);

    // Load demo security logs
    const demoLogs: SecurityLog[] = [
      {
        id: '1',
        timestamp: Date.now() - 300000,
        type: 'join',
        userId: 'user_abc123',
        description: 'User joined room SecureDemo2024'
      },
      {
        id: '2',
        timestamp: Date.now() - 600000,
        type: 'message',
        userId: 'user_def456',
        description: 'Message sent in room SecureDemo2024'
      },
      {
        id: '3',
        timestamp: Date.now() - 900000,
        type: 'file_share',
        userId: 'user_ghi789',
        description: 'File shared in room SecureDemo2024'
      }
    ];
    
    setSecurityLogs(demoLogs);
  }, []);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (room: RoomInfo) => {
    if (Date.now() > room.expiresAt) return 'text-destructive';
    if (room.isActive && room.userCount > 0) return 'text-neon-green';
    return 'text-muted-foreground';
  };

  const getStatusText = (room: RoomInfo) => {
    if (Date.now() > room.expiresAt) return 'Expired';
    if (room.isActive && room.userCount > 0) return 'Active';
    if (room.userCount === 0) return 'Empty';
    return 'Inactive';
  };

  const deleteRoom = (roomId: string) => {
    setActiveRooms(prev => prev.filter(r => r.id !== roomId));
    toast({
      title: "Room Deleted",
      description: "Room has been permanently removed and all data destroyed.",
    });
  };

  const copyRoomLink = (code: string) => {
    const link = `${window.location.origin}/chat/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Room Link Copied",
      description: "Secure room link copied to clipboard.",
    });
  };

  const extendRoomExpiry = (roomId: string, hours: number) => {
    setActiveRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, expiresAt: room.expiresAt + (hours * 60 * 60 * 1000) }
        : room
    ));
    toast({
      title: "Room Extended",
      description: `Room expiry extended by ${hours} hour${hours > 1 ? 's' : ''}.`,
    });
  };

  const toggleRoomSetting = (roomId: string, setting: keyof RoomInfo, value: boolean) => {
    setActiveRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, [setting]: value }
        : room
    ));
  };

  const filteredRooms = activeRooms.filter(room => {
    if (filterStatus === 'active') return room.isActive && room.userCount > 0;
    if (filterStatus === 'expired') return Date.now() > room.expiresAt;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Room Management
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  Monitor and manage your secure chat rooms
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSecurityLogs(!showSecurityLogs)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Security Logs
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Room List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Active Rooms ({filteredRooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedRoom?.id === room.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{room.name || room.code}</h3>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(room)}
                          >
                            {getStatusText(room)}
                          </Badge>
                          {room.hasPassword && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Code: {room.code}
                        </p>
                        {room.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {room.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyRoomLink(room.code);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Room</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the room and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRoom(room.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Room
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{room.userCount}/{room.maxUsers} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-3 w-3" />
                          <span>{room.messageCount} messages</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Expires in {formatDuration(room.expiresAt - Date.now())}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Last activity: {formatTimeAgo(room.lastActivity)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {room.enableVideo && (
                        <Badge variant="outline" className="text-xs">Video</Badge>
                      )}
                      {room.enableFileSharing && (
                        <Badge variant="outline" className="text-xs">Files</Badge>
                      )}
                      {room.enableScreenShare && (
                        <Badge variant="outline" className="text-xs">Screen Share</Badge>
                      )}
                    </div>
                  </div>
                ))}

                {filteredRooms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rooms match the current filter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Room Details / Security Logs */}
          <div className="space-y-4">
            {showSecurityLogs ? (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    Security Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-card border text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="capitalize">
                          {log.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User: {log.userId}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : selectedRoom ? (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Room Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Room Code:</span>
                        <span className="font-mono">{selectedRoom.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatTimeAgo(selectedRoom.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Encryption:</span>
                        <span className="font-mono text-xs">{selectedRoom.encryptionFingerprint}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => extendRoomExpiry(selectedRoom.id, 2)}
                      >
                        +2 Hours
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => extendRoomExpiry(selectedRoom.id, 24)}
                      >
                        +24 Hours
                      </Button>
                      <Button variant="outline" size="sm" className="col-span-2">
                        Export Logs
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Video Calls</span>
                        <Switch 
                          checked={selectedRoom.enableVideo}
                          onCheckedChange={(checked) => toggleRoomSetting(selectedRoom.id, 'enableVideo', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">File Sharing</span>
                        <Switch 
                          checked={selectedRoom.enableFileSharing}
                          onCheckedChange={(checked) => toggleRoomSetting(selectedRoom.id, 'enableFileSharing', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Screen Share</span>
                        <Switch 
                          checked={selectedRoom.enableScreenShare}
                          onCheckedChange={(checked) => toggleRoomSetting(selectedRoom.id, 'enableScreenShare', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Destroy Room
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Destroy Room Immediately</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately destroy the room and kick all users. All data will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRoom(selectedRoom.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Destroy Now
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Select a Room</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a room from the list to view details and manage settings
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;
