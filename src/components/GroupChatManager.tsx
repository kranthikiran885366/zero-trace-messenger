import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  Settings, 
  Edit, 
  UserMinus,
  MoreVertical,
  Camera,
  Link,
  Bell,
  BellOff,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface GroupParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline: boolean;
  lastSeen?: Date;
  joinedAt: Date;
  permissions?: {
    canInvite: boolean;
    canEditGroup: boolean;
    canDeleteMessages: boolean;
  };
}

export interface GroupSettings {
  name: string;
  description: string;
  avatar?: string;
  isPrivate: boolean;
  allowMembersToInvite: boolean;
  allowMembersToEditGroup: boolean;
  requireAdminApproval: boolean;
  disableNotifications: boolean;
  disappearingMessages: boolean;
  disappearingTime: number; // in seconds
  onlyAdminsCanSend: boolean;
  encryptionLevel: 'standard' | 'high' | 'military';
}

interface GroupChatManagerProps {
  groupId: string;
  currentUserId: string;
  initialSettings: GroupSettings;
  initialParticipants: GroupParticipant[];
  onSettingsUpdate: (settings: GroupSettings) => void;
  onParticipantUpdate: (participants: GroupParticipant[]) => void;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
}

const GroupChatManager: React.FC<GroupChatManagerProps> = ({
  groupId,
  currentUserId,
  initialSettings,
  initialParticipants,
  onSettingsUpdate,
  onParticipantUpdate,
  onLeaveGroup,
  onDeleteGroup
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GroupSettings>(initialSettings);
  const [participants, setParticipants] = useState<GroupParticipant[]>(initialParticipants);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [newMemberIdentifier, setNewMemberIdentifier] = useState('');
  const [inviteLink, setInviteLink] = useState(`https://securechat.app/join/${groupId}`);

  const currentUser = participants.find(p => p.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const canEditGroup = isAdmin || (currentUser?.permissions?.canEditGroup && settings.allowMembersToEditGroup);

  const handleSettingsUpdate = (newSettings: Partial<GroupSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsUpdate(updatedSettings);
    
    toast({
      title: "Group Settings Updated",
      description: "Changes have been saved successfully.",
    });
  };

  const handleRoleChange = (participantId: string, newRole: GroupParticipant['role']) => {
    if (!isAdmin) return;

    const updatedParticipants = participants.map(p =>
      p.id === participantId ? { ...p, role: newRole } : p
    );
    setParticipants(updatedParticipants);
    onParticipantUpdate(updatedParticipants);

    toast({
      title: "Role Updated",
      description: `Participant role changed to ${newRole}.`,
    });
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!isAdmin && !currentUser?.permissions?.canEditGroup) return;

    const updatedParticipants = participants.filter(p => p.id !== participantId);
    setParticipants(updatedParticipants);
    onParticipantUpdate(updatedParticipants);

    toast({
      title: "Member Removed",
      description: "Participant has been removed from the group.",
      variant: "destructive"
    });
  };

  const handleAddMember = () => {
    if (!newMemberIdentifier.trim()) return;

    const newParticipant: GroupParticipant = {
      id: `user_${Date.now()}`,
      name: newMemberIdentifier,
      role: 'member',
      isOnline: false,
      joinedAt: new Date(),
      permissions: {
        canInvite: settings.allowMembersToInvite,
        canEditGroup: settings.allowMembersToEditGroup,
        canDeleteMessages: false
      }
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);
    onParticipantUpdate(updatedParticipants);
    setNewMemberIdentifier('');
    setShowAddMember(false);

    toast({
      title: "Member Added",
      description: "New member has been added to the group.",
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite Link Copied",
      description: "Group invite link has been copied to clipboard.",
    });
  };

  const regenerateInviteLink = () => {
    const newLink = `https://securechat.app/join/${groupId}?token=${Date.now()}`;
    setInviteLink(newLink);
    toast({
      title: "Invite Link Regenerated",
      description: "A new invite link has been generated.",
    });
  };

  const exportGroupData = () => {
    const groupData = {
      settings,
      participants: participants.map(p => ({ ...p, permissions: undefined })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(groupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_${groupId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Group Data Exported",
      description: "Group data has been exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24">
            <AvatarImage src={settings.avatar} />
            <AvatarFallback className="text-2xl">
              {settings.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {canEditGroup && (
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
              onClick={() => setShowEditGroup(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">{settings.name}</h2>
          {settings.description && (
            <p className="text-muted-foreground mt-1">{settings.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participants.length} members
            </span>
            <Badge variant={settings.isPrivate ? "destructive" : "secondary"}>
              {settings.isPrivate ? <Lock className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {settings.isPrivate ? 'Private' : 'Public'}
            </Badge>
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              {settings.encryptionLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(isAdmin || settings.allowMembersToInvite) && (
          <Button variant="outline" onClick={() => setShowAddMember(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
        
        <Button variant="outline" onClick={copyInviteLink}>
          <Link className="h-4 w-4 mr-2" />
          Invite Link
        </Button>
        
        {canEditGroup && (
          <Button variant="outline" onClick={() => setShowGroupSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
        
        <Button variant="outline" onClick={exportGroupData}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Participants</h3>
          <span className="text-sm text-muted-foreground">
            {participants.filter(p => p.isOnline).length} online
          </span>
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{participant.name}</span>
                      {participant.id === currentUserId && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                      {participant.role === 'admin' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {participant.role === 'moderator' && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {participant.isOnline ? 'Online' : 
                       participant.lastSeen ? `Last seen ${participant.lastSeen.toLocaleDateString()}` : 
                       'Offline'} • Joined {participant.joinedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isAdmin && participant.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleRoleChange(participant.id, 'admin')}
                        disabled={participant.role === 'admin'}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRoleChange(participant.id, 'moderator')}
                        disabled={participant.role === 'moderator'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRoleChange(participant.id, 'member')}
                        disabled={participant.role === 'member'}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <div className="space-y-2">
          <Button variant="outline" onClick={onLeaveGroup} className="w-full">
            Leave Group
          </Button>
          {isAdmin && (
            <Button variant="destructive" onClick={onDeleteGroup} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to the group by their username or invite code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username or user ID"
              value={newMemberIdentifier}
              onChange={(e) => setNewMemberIdentifier(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Link</label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button variant="outline" onClick={copyInviteLink}>
                  Copy
                </Button>
                <Button variant="outline" onClick={regenerateInviteLink}>
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!newMemberIdentifier.trim()}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Group description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGroup(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSettingsUpdate(settings);
              setShowEditGroup(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Settings Dialog */}
      <Dialog open={showGroupSettings} onOpenChange={setShowGroupSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
            <DialogDescription>
              Configure group privacy and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Privacy</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Private Group</label>
                    <p className="text-xs text-muted-foreground">Only invited members can join</p>
                  </div>
                  <Switch
                    checked={settings.isPrivate}
                    onCheckedChange={(checked) => handleSettingsUpdate({ isPrivate: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require Admin Approval</label>
                    <p className="text-xs text-muted-foreground">New members need admin approval</p>
                  </div>
                  <Switch
                    checked={settings.requireAdminApproval}
                    onCheckedChange={(checked) => handleSettingsUpdate({ requireAdminApproval: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Member Permissions */}
            <div className="space-y-4">
              <h4 className="font-medium">Member Permissions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Members Can Invite</label>
                    <p className="text-xs text-muted-foreground">Allow members to invite others</p>
                  </div>
                  <Switch
                    checked={settings.allowMembersToInvite}
                    onCheckedChange={(checked) => handleSettingsUpdate({ allowMembersToInvite: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Members Can Edit Group</label>
                    <p className="text-xs text-muted-foreground">Allow members to edit group info</p>
                  </div>
                  <Switch
                    checked={settings.allowMembersToEditGroup}
                    onCheckedChange={(checked) => handleSettingsUpdate({ allowMembersToEditGroup: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Only Admins Can Send</label>
                    <p className="text-xs text-muted-foreground">Restrict messaging to admins only</p>
                  </div>
                  <Switch
                    checked={settings.onlyAdminsCanSend}
                    onCheckedChange={(checked) => handleSettingsUpdate({ onlyAdminsCanSend: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Security</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Disappearing Messages</label>
                    <p className="text-xs text-muted-foreground">Messages auto-delete after time limit</p>
                  </div>
                  <Switch
                    checked={settings.disappearingMessages}
                    onCheckedChange={(checked) => handleSettingsUpdate({ disappearingMessages: checked })}
                  />
                </div>
                {settings.disappearingMessages && (
                  <div>
                    <label className="text-sm font-medium">Disappear After</label>
                    <select
                      value={settings.disappearingTime}
                      onChange={(e) => handleSettingsUpdate({ disappearingTime: parseInt(e.target.value) })}
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                    >
                      <option value={300}>5 minutes</option>
                      <option value={3600}>1 hour</option>
                      <option value={86400}>24 hours</option>
                      <option value={604800}>7 days</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupSettings(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupChatManager;
