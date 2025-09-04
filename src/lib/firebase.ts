// Temporary Firebase stub - install Firebase with: npm install firebase
// This file provides fallback implementations until Firebase is properly installed

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  nickname: string;
  preferences: {
    theme: string;
    autoDeleteMessages: boolean;
    enableNotifications: boolean;
    showTypingIndicators: boolean;
    autoJoinVideo: boolean;
    defaultMessageTimer: number;
    preferredQuality: string;
    enableSteganography: boolean;
    enableOnionRouting: boolean;
  };
  stats: {
    roomsJoined: number;
    messagesExchanged: number;
    filesShared: number;
    callMinutes: number;
    lastRoomJoined?: Date;
  };
  status: 'online' | 'away' | 'busy' | 'offline' | 'invisible';
  createdAt: Date;
  lastActive: Date;
  isAnonymous: boolean;
}

export const FIREBASE_AVAILABLE = false;

// Temporary implementations - these will be replaced with real Firebase when installed
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<any> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const signInWithEmail = async (email: string, password: string): Promise<any> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const signInWithGoogle = async (): Promise<any> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const signInWithGithub = async (): Promise<any> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const createAnonymousUser = async (nickname: string): Promise<UserProfile> => {
  try {
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    const anonymousUser: UserProfile = {
      uid: anonymousId,
      email: `${anonymousId}@anonymous.local`,
      displayName: nickname,
      nickname: nickname,
      preferences: {
        theme: 'cyber',
        autoDeleteMessages: true,
        enableNotifications: true,
        showTypingIndicators: false,
        autoJoinVideo: false,
        defaultMessageTimer: 300000,
        preferredQuality: 'medium',
        enableSteganography: false,
        enableOnionRouting: false
      },
      stats: {
        roomsJoined: 0,
        messagesExchanged: 0,
        filesShared: 0,
        callMinutes: 0
      },
      status: 'online',
      createdAt: new Date(),
      lastActive: new Date(),
      isAnonymous: true
    };
    
    // Store anonymous user data locally
    localStorage.setItem('anonymousUser', JSON.stringify(anonymousUser));
    localStorage.setItem('anonymousSession', 'true');
    
    return anonymousUser;
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    throw error;
  }
};

export const createUserProfile = async (user: any, nickname: string): Promise<void> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const resetPassword = async (email: string): Promise<void> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const deleteUserAccount = async (): Promise<void> => {
  throw new Error('Firebase not installed. Please run: npm install firebase');
};

export const logOut = async (): Promise<void> => {
  try {
    // Clear anonymous session if exists
    localStorage.removeItem('anonymousUser');
    localStorage.removeItem('anonymousSession');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Stub auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  // Return a no-op unsubscribe function
  return () => {};
};

// Placeholder exports for Firebase types
export const auth = null;
export const db = null;
export const storage = null;
export const googleProvider = null;
export const githubProvider = null;

console.warn('⚠️  Firebase not installed. Install with: npm install firebase');
console.warn('⚠️  Only anonymous authentication is available until Firebase is installed.');

export default null;
