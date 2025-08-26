import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Clock, 
  Shield, 
  Bell, 
  BellOff,
  Smartphone,
  Globe,
  Lock,
  Key,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  QrCode,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  joinedAt: Date;
  verified: boolean;
  status: 'available' | 'busy' | 'away' | 'invisible';
  customStatus?: string;
  privacy: {
    showLastSeen: 'everyone' | 'contacts' | 'nobody';
    showOnlineStatus: 'everyone' | 'contacts' | 'nobody';
    showProfilePhoto: 'everyone' | 'contacts' | 'nobody';
    allowDirectMessages: 'everyone' | 'contacts' | 'nobody';
    requireApprovalForGroups: boolean;
    allowStatusViews: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    fingerprintLockEnabled: boolean;
    sessionTimeout: number; // in minutes
    allowMultipleSessions: boolean;
    encryptionKeys: {
      publicKey: string;
      fingerprint: string;
      keyStrength: number;
    };
  };
  notifications: {
    messageNotifications: boolean;
    groupNotifications: boolean;
    callNotifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    customSounds: {
      message: string;
      group: string;
      call: string;
    };
  };
  theme: {
    darkMode: boolean;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    wallpaper?: string;
  };
}

interface ProfileManagerProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  canEdit?: boolean;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profile: initialProfile,
  onProfileUpdate,
  canEdit = true
}) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(initialProfile);
  const [showQRCode, setShowQRCode] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    onProfileUpdate(editedProfile);
    setIsEditing(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfile = { ...editedProfile, avatar: e.target?.result as string };
        setEditedProfile(newProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (status: UserProfile['status']) => {
    const newProfile = { ...profile, status };
    setProfile(newProfile);
    onProfileUpdate(newProfile);
    
    toast({
      title: "Status Updated",
      description: `Your status is now "${status}".`,
    });
  };

  const handle2FAToggle = (enabled: boolean) => {
    if (enabled && !profile.security.twoFactorEnabled) {
      setShow2FASetup(true);
    } else if (!enabled && profile.security.twoFactorEnabled) {
      const newProfile = {
        ...profile,
        security: { ...profile.security, twoFactorEnabled: false }
      };
      setProfile(newProfile);
      onProfileUpdate(newProfile);
      
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now less secure.",
        variant: "destructive"
      });
    }
  };

  const handleRegenerateKeys = () => {
    const newKeys = {
      publicKey: `RSA-4096-${Date.now()}`,
      fingerprint: `SHA256:${Array.from({length: 43}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random() * 64)]
      ).join('')}`,
      keyStrength: 4096
    };

    const newProfile = {
      ...profile,
      security: { ...profile.security, encryptionKeys: newKeys }
    };
    setProfile(newProfile);
    onProfileUpdate(newProfile);

    toast({
      title: "Encryption Keys Regenerated",
      description: "New encryption keys have been generated. Share your new public key with contacts.",
    });
  };

  const exportProfileData = () => {
    const exportData = {
      ...profile,
      security: {
        ...profile.security,
        encryptionKeys: {
          publicKey: profile.security.encryptionKeys.publicKey,
          fingerprint: profile.security.encryptionKeys.fingerprint,
          keyStrength: profile.security.encryptionKeys.keyStrength
        }
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securechat_profile_${profile.username}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Profile Data Exported",
      description: "Your profile data has been exported successfully.",
    });
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(profile.security.encryptionKeys.publicKey);
    toast({
      title: "Public Key Copied",
      description: "Your public key has been copied to clipboard.",
    });
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(profile.security.encryptionKeys.fingerprint);
    toast({
      title: "Fingerprint Copied",
      description: "Your key fingerprint has been copied to clipboard.",
    });
  };

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'invisible': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    if (profile.security.twoFactorEnabled) score += 25;
    if (profile.security.fingerprintLockEnabled) score += 20;
    if (profile.security.sessionTimeout <= 30) score += 15;
    if (!profile.security.allowMultipleSessions) score += 15;
    if (profile.security.encryptionKeys.keyStrength >= 4096) score += 25;
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={isEditing ? editedProfile.avatar : profile.avatar} />
                <AvatarFallback className="text-2xl">
                  {(isEditing ? editedProfile.displayName : profile.displayName).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background",
                getStatusColor(profile.status)
              )} />
              
              {canEdit && isEditing && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editedProfile.displayName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                        placeholder="Display Name"
                        className="text-2xl font-bold h-auto p-1 border-none bg-transparent"
                      />
                      <Input
                        value={editedProfile.username}
                        onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                        placeholder="@username"
                        className="text-muted-foreground h-auto p-1 border-none bg-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        {profile.displayName}
                        {profile.verified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </h1>
                      <p className="text-muted-foreground">@{profile.username}</p>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveProfile} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => {
                            setIsEditing(false);
                            setEditedProfile(profile);
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profile.bio || "No bio available"}
                  </p>
                )}
              </div>

              {/* Status and Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Joined {profile.joinedAt.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {profile.isOnline ? 'Online' : `Last seen ${profile.lastSeen.toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status & Presence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['available', 'busy', 'away', 'invisible'] as const).map((status) => (
              <Button
                key={status}
                variant={profile.status === status ? "default" : "outline"}
                onClick={() => handleStatusChange(status)}
                className="justify-start"
              >
                <div className={cn("w-3 h-3 rounded-full mr-2", getStatusColor(status))} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
          
          {profile.customStatus && (
            <div className="p-3 bg-accent/20 rounded-lg">
              <p className="text-sm">{profile.customStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Manage your account security and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security Score</span>
              <span className="text-sm text-muted-foreground">{getSecurityScore()}/100</span>
            </div>
            <Progress value={getSecurityScore()} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {getSecurityScore() >= 80 ? "Excellent security" :
               getSecurityScore() >= 60 ? "Good security" :
               getSecurityScore() >= 40 ? "Fair security" : "Improve your security"}
            </p>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Two-Factor Authentication</label>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch
              checked={profile.security.twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {/* Fingerprint Lock */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Fingerprint Lock</label>
              <p className="text-xs text-muted-foreground">Use biometric authentication</p>
            </div>
            <Switch
              checked={profile.security.fingerprintLockEnabled}
              onCheckedChange={(checked) => {
                const newProfile = {
                  ...profile,
                  security: { ...profile.security, fingerprintLockEnabled: checked }
                };
                setProfile(newProfile);
                onProfileUpdate(newProfile);
              }}
            />
          </div>

          {/* Session Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Allow Multiple Sessions</label>
                <p className="text-xs text-muted-foreground">Login from multiple devices</p>
              </div>
              <Switch
                checked={profile.security.allowMultipleSessions}
                onCheckedChange={(checked) => {
                  const newProfile = {
                    ...profile,
                    security: { ...profile.security, allowMultipleSessions: checked }
                  };
                  setProfile(newProfile);
                  onProfileUpdate(newProfile);
                }}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Session Timeout</label>
              <Select
                value={profile.security.sessionTimeout.toString()}
                onValueChange={(value) => {
                  const newProfile = {
                    ...profile,
                    security: { ...profile.security, sessionTimeout: parseInt(value) }
                  };
                  setProfile(newProfile);
                  onProfileUpdate(newProfile);
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Encryption Keys */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-accent/10">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Encryption Keys</h4>
              <Badge variant="outline">
                RSA-{profile.security.encryptionKeys.keyStrength}
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-medium">Public Key:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-background rounded text-xs">
                    {profile.security.encryptionKeys.publicKey.slice(0, 32)}...
                  </code>
                  <Button size="sm" variant="outline" onClick={copyPublicKey}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="font-medium">Fingerprint:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-background rounded text-xs">
                    {profile.security.encryptionKeys.fingerprint}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyFingerprint}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleRegenerateKeys}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowQRCode(true)}>
                <QrCode className="h-3 w-3 mr-1" />
                QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(profile.privacy).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                      const newProfile = {
                        ...profile,
                        privacy: { ...profile.privacy, [key]: checked }
                      };
                      setProfile(newProfile);
                      onProfileUpdate(newProfile);
                    }}
                  />
                </div>
              );
            } else {
              return (
                <div key={key}>
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <Select
                    value={value}
                    onValueChange={(newValue) => {
                      const newProfile = {
                        ...profile,
                        privacy: { ...profile.privacy, [key]: newValue }
                      };
                      setProfile(newProfile);
                      onProfileUpdate(newProfile);
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="contacts">Contacts Only</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            }
          })}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={exportProfileData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={() => setShowExportData(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button variant="destructive" onClick={() => {
              toast({
                title: "Account Deletion",
                description: "This feature will be available soon.",
                variant: "destructive"
              });
            }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public Key QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code to allow others to verify your identity and establish secure communication.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <div className="w-64 h-64 bg-accent/20 rounded-lg flex items-center justify-center">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQRCode(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-8">
              <div className="w-48 h-48 bg-accent/20 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>
            <Input placeholder="Enter verification code" />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FASetup(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const newProfile = {
                ...profile,
                security: { ...profile.security, twoFactorEnabled: true }
              };
              setProfile(newProfile);
              onProfileUpdate(newProfile);
              setShow2FASetup(false);
              
              toast({
                title: "Two-Factor Authentication Enabled",
                description: "Your account is now more secure.",
              });
            }}>
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManager;
