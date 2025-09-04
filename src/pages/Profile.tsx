import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileManager, { type UserProfile } from '@/components/ProfileManager';
import Navigation from '@/components/Navigation';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const defaultProfile: UserProfile = useMemo(() => ({
    id: user?.id || user?.userId || 'current-user',
    username: user?.email?.split('@')[0] || (user?.nickname || 'anonymous').toLowerCase(),
    displayName: user?.nickname || 'Anonymous User',
    bio: 'Secure by default. Privacy first.',
    avatar: (user as any)?.avatar,
    isOnline: true,
    lastSeen: new Date(),
    joinedAt: new Date(),
    verified: false,
    status: 'available',
    customStatus: '',
    privacy: {
      showLastSeen: 'contacts',
      showOnlineStatus: 'everyone',
      showProfilePhoto: 'everyone',
      allowDirectMessages: 'contacts',
      requireApprovalForGroups: true,
      allowStatusViews: true
    },
    security: {
      twoFactorEnabled: false,
      fingerprintLockEnabled: false,
      sessionTimeout: 30,
      allowMultipleSessions: false,
      encryptionKeys: {
        publicKey: 'RSA-4096-DEFAULT',
        fingerprint: 'SHA256:DEFAULT-FINGERPRINT',
        keyStrength: 4096
      }
    },
    notifications: {
      messageNotifications: true,
      groupNotifications: true,
      callNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      customSounds: {
        message: 'default',
        group: 'default',
        call: 'default'
      }
    },
    theme: {
      darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      accentColor: '#10b981',
      fontSize: 'medium'
    }
  }), [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <ProfileManager
          profile={defaultProfile}
          onProfileUpdate={(p) => {
            console.log('Profile updated:', p);
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
