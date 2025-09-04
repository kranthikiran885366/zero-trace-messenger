import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  onAuthStateChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGithub,
  createAnonymousUser,
  getUserProfile,
  updateUserProfile,
  logOut,
  resetPassword,
  changePassword,
  deleteUserAccount,
  UserProfile
} from '@/lib/firebase';

// Extend the UserProfile interface to match existing User interface
export interface User extends UserProfile {
  id: string;
  _id: string;
  userId: string;
  fingerprint: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, nickname: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  createAnonymousSession: (nickname: string, preferences?: any) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  refreshUser: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Check if Firebase is available
  useEffect(() => {
    try {
      // Use explicit flag exported by firebase stub/implementation
      const flag = ((): boolean => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          return (require('@/lib/firebase') as any).FIREBASE_AVAILABLE === true;
        } catch {
          return false;
        }
      })();
      setIsFirebaseAvailable(flag);
      if (!flag) {
        console.warn('Firebase not available, only anonymous authentication supported');
      }
    } catch (error) {
      setIsFirebaseAvailable(false);
    }
  }, []);

  // Convert Firebase user and profile to our User interface
  const createUserFromProfile = (firebaseUser: any | null, profile: UserProfile | null): User | null => {
    if (!firebaseUser && !profile) return null;
    
    if (profile?.isAnonymous) {
      // For anonymous users, use the profile data
      return {
        ...profile,
        id: profile.uid,
        _id: profile.uid,
        userId: profile.uid,
        fingerprint: `fp_${profile.uid.slice(-12)}`
      };
    }
    
    if (!firebaseUser || !profile) return null;
    
    return {
      ...profile,
      id: firebaseUser.uid,
      _id: firebaseUser.uid,
      userId: firebaseUser.uid,
      fingerprint: `fp_${firebaseUser.uid.slice(-12)}`
    };
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for anonymous session first
        const anonymousSession = localStorage.getItem('anonymousSession');
        const anonymousUserData = localStorage.getItem('anonymousUser');
        
        if (anonymousSession === 'true' && anonymousUserData) {
          const anonymousUser = JSON.parse(anonymousUserData);
          const user = createUserFromProfile(null, anonymousUser);
          setUser(user);
          setIsLoading(false);
          return;
        }
        
        // Only set up Firebase auth state listener if Firebase is available
        if (isFirebaseAvailable) {
          try {
            const unsubscribe = onAuthStateChange(async (firebaseUser) => {
              try {
                if (firebaseUser) {
                  // User is signed in
                  const profile = await getUserProfile(firebaseUser.uid);
                  if (profile) {
                    const user = createUserFromProfile(firebaseUser, profile);
                    setUser(user);
                    
                    // Update last active timestamp
                    await updateUserProfile(firebaseUser.uid, {
                      lastActive: new Date(),
                      status: 'online'
                    });
                  }
                } else {
                  // User is signed out
                  setUser(null);
                }
              } catch (error) {
                console.error('Error in auth state change:', error);
                setUser(null);
              } finally {
                setIsLoading(false);
              }
            });
            
            // Cleanup function
            return () => unsubscribe();
          } catch (error) {
            console.error('Error setting up Firebase auth listener:', error);
            setIsLoading(false);
          }
        } else {
          // Firebase not available, just set loading to false
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isFirebaseAvailable]);

  const login = async (email: string, password: string): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Email authentication requires Firebase. Please install Firebase or use anonymous mode.');
    }

    try {
      setIsLoading(true);
      const firebaseUser = await signInWithEmail(email, password);
      
      // Get user profile
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        const user = createUserFromProfile(firebaseUser, profile);
        setUser(user);
        
        toast({
          title: "Welcome Back!",
          description: `Signed in as ${profile.displayName}`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.message.includes('Firebase not installed')) {
        errorMessage = 'Email authentication is not available. Please use anonymous mode.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, nickname: string): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Email registration requires Firebase. Please install Firebase or use anonymous mode.');
    }

    try {
      setIsLoading(true);
      const firebaseUser = await signUpWithEmail(email, password, displayName);
      
      // Get the created user profile
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        const user = createUserFromProfile(firebaseUser, profile);
        setUser(user);
        
        toast({
          title: "Account Created!",
          description: `Welcome to SecureChat, ${displayName}!`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message.includes('Firebase not installed')) {
        errorMessage = 'Email registration is not available. Please use anonymous mode.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Google authentication requires Firebase. Please install Firebase or use anonymous mode.');
    }

    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        const user = createUserFromProfile(firebaseUser, profile);
        setUser(user);
        
        toast({
          title: "Google Sign In Successful!",
          description: `Welcome, ${profile.displayName}!`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.message.includes('Firebase not installed')) {
        errorMessage = 'Google authentication is not available. Please use anonymous mode.';
      }
      
      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGithub = async (): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('GitHub authentication requires Firebase. Please install Firebase or use anonymous mode.');
    }

    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGithub();
      
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        const user = createUserFromProfile(firebaseUser, profile);
        setUser(user);
        
        toast({
          title: "GitHub Sign In Successful!",
          description: `Welcome, ${profile.displayName}!`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('GitHub sign in error:', error);
      let errorMessage = 'Failed to sign in with GitHub. Please try again.';
      
      if (error.message.includes('Firebase not installed')) {
        errorMessage = 'GitHub authentication is not available. Please use anonymous mode.';
      }
      
      toast({
        title: "GitHub Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createAnonymousSession = async (nickname: string, preferences = {}): Promise<void> => {
    try {
      setIsLoading(true);

      // Prefer backend anonymous auth to obtain API token for protected endpoints
      const { user: backendUser, token } = await api.createAnonymousSession(nickname, preferences);

      // Persist auth via API client and set local auth context user
      const mappedUser: User = {
        id: backendUser.userId,
        _id: backendUser._id,
        userId: backendUser.userId,
        fingerprint: backendUser.fingerprint,
        email: `${backendUser.userId}@anonymous.local`,
        displayName: backendUser.nickname,
        nickname: backendUser.nickname,
        photoURL: undefined,
        preferences: backendUser.preferences,
        stats: backendUser.stats,
        status: backendUser.status,
        createdAt: new Date(backendUser.createdAt),
        lastActive: new Date(backendUser.lastActive),
        isAnonymous: true
      };

      setUser(mappedUser);
      localStorage.setItem('anonymousSession', 'true');
      localStorage.setItem('anonymousUser', JSON.stringify(mappedUser));

      toast({
        title: "Anonymous Session Created",
        description: `Welcome, ${nickname}! Your session is now active.`,
        variant: "default"
      });
    } catch (error: any) {
      // Fallback to local anonymous stub if backend is unavailable
      try {
        const anonymousUser = await createAnonymousUser(nickname);
        const user = createUserFromProfile(null, anonymousUser);
        setUser(user);
        toast({
          title: "Anonymous Session Created (Local)",
          description: `Welcome, ${nickname}!`,
          variant: "default"
        });
      } catch (innerError: any) {
        console.error('Anonymous session error:', innerError);
        toast({
          title: "Session Creation Failed",
          description: innerError.message || 'Failed to create anonymous session.',
          variant: "destructive"
        });
        throw innerError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logOut();
      setUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<void> => {
    if (!user) return;
    
    try {
      if (user.isAnonymous) {
        // Update anonymous user locally
        const updatedUser = {
          ...user,
          preferences: { ...user.preferences, ...preferences }
        };
        setUser(updatedUser);
        localStorage.setItem('anonymousUser', JSON.stringify(updatedUser));
      } else if (isFirebaseAvailable) {
        // Update Firebase user
        await updateUserProfile(user.uid, { preferences: { ...user.preferences, ...preferences } });
        setUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : null);
      }
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Update preferences error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update preferences.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      if (user.isAnonymous) {
        // For anonymous users, just update the timestamp
        const updatedUser = { ...user, lastActive: new Date() };
        setUser(updatedUser);
        localStorage.setItem('anonymousUser', JSON.stringify(updatedUser));
      } else if (isFirebaseAvailable) {
        // Refresh Firebase user profile
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const updatedUser = createUserFromProfile(null, profile);
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const resetUserPassword = async (email: string): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Password reset requires Firebase. Please install Firebase.');
    }

    try {
      await resetPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email.';
      
      if (error.message.includes('Firebase not installed')) {
        errorMessage = 'Password reset is not available. Please install Firebase.';
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    }
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Password change requires Firebase. Please install Firebase.');
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      toast({
        title: "Password Change Failed",
        description: "Failed to change password.",
        variant: "destructive"
      });
      
      throw new Error("Failed to change password.");
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!isFirebaseAvailable) {
      throw new Error('Account deletion requires Firebase. Please install Firebase.');
    }

    try {
      await deleteUserAccount();
      setUser(null);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Account Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isFirebaseAvailable,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    createAnonymousSession,
    logout,
    updatePreferences,
    refreshUser,
    resetUserPassword,
    changeUserPassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
