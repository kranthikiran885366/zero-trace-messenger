import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import GroupChatManager, { type GroupSettings, type GroupParticipant } from '@/components/GroupChatManager';
import { useAuth } from '@/contexts/AuthContext';

const GroupSettingsPage: React.FC = () => {
  const { roomId } = useParams();
  const { user } = useAuth();

  const initialSettings: GroupSettings = useMemo(() => ({
    name: `Room ${roomId?.slice(-6) || 'Group'}`,
    description: 'Manage group settings, privacy, and participants',
    avatar: undefined,
    isPrivate: true,
    allowMembersToInvite: true,
    allowMembersToEditGroup: false,
    requireAdminApproval: true,
    disableNotifications: false,
    disappearingMessages: false,
    disappearingTime: 3600,
    onlyAdminsCanSend: false,
    encryptionLevel: 'high'
  }), [roomId]);

  const initialParticipants: GroupParticipant[] = useMemo(() => ([
    {
      id: user?.id || user?.userId || 'current-user',
      name: user?.nickname || 'You',
      avatar: (user as any)?.avatar,
      role: 'admin',
      isOnline: true,
      lastSeen: new Date(),
      joinedAt: new Date(),
      permissions: {
        canInvite: true,
        canEditGroup: true,
        canDeleteMessages: true
      }
    },
    {
      id: 'member-1',
      name: 'Anonymous User',
      role: 'member',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30),
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  ]), [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <GroupChatManager
          groupId={roomId || 'group'}
          currentUserId={user?.id || user?.userId || 'current-user'}
          initialSettings={initialSettings}
          initialParticipants={initialParticipants}
          onSettingsUpdate={(settings) => {
            console.log('Group settings updated:', settings);
          }}
          onParticipantUpdate={(participants) => {
            console.log('Participants updated:', participants);
          }}
          onLeaveGroup={() => {
            window.history.back();
          }}
          onDeleteGroup={() => {
            alert('Group deleted (demo)');
          }}
        />
      </div>
    </div>
  );
};

export default GroupSettingsPage;
