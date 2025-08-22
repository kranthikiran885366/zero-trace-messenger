import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure GitHub provider
githubProvider.addScope('user:email');

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

// Authentication functions
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    await createUserProfile(user, displayName);
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if this is a new user
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserProfile(user, user.displayName || 'User');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithGithub = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    
    // Check if this is a new user
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserProfile(user, user.displayName || 'User');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
};

export const createAnonymousUser = async (nickname: string): Promise<UserProfile> => {
  try {
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    
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

export const createUserProfile = async (user: FirebaseUser, nickname: string): Promise<void> => {
  try {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || nickname,
      photoURL: user.photoURL || undefined,
      nickname: nickname,
      preferences: {
        theme: 'cyber',
        autoDeleteMessages: false,
        enableNotifications: true,
        showTypingIndicators: true,
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
      isAnonymous: false
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deleteUserAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    // Delete user profile from Firestore
    await setDoc(doc(db, 'users', user.uid), { deleted: true, deletedAt: serverTimestamp() }, { merge: true });
    
    // Delete user account
    await deleteUser(user);
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    // Clear anonymous session if exists
    localStorage.removeItem('anonymousUser');
    localStorage.removeItem('anonymousSession');
    
    // Sign out from Firebase
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
