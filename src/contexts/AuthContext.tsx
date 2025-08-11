import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, wsClient, User, handleAPIError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  createAnonymousSession: (nickname: string, preferences?: any) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already authenticated
        const storedUser = api.getUser();
        if (storedUser) {
          // Verify token with server
          const { valid, user: verifiedUser } = await api.verifyToken();
          
          if (valid && verifiedUser) {
            setUser(verifiedUser);
            
            // Connect WebSocket
            const token = localStorage.getItem('auth_token');
            if (token) {
              try {
                await wsClient.connect(token);
                setupWebSocketListeners();
              } catch (error) {
                console.error('WebSocket connection failed:', error);
              }
            }
          } else {
            // Token is invalid, clear auth
            api.clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        api.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Setup WebSocket event listeners
  const setupWebSocketListeners = () => {
    // Handle connection events
    wsClient.on('connect', () => {
      console.log('✅ Real-time connection established');
      toast({
        title: "Connected",
        description: "Real-time features are now active",
      });
    });

    wsClient.on('disconnect', () => {
      console.log('🔌 Real-time connection lost');
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "Attempting to reconnect...",
      });
    });

    wsClient.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish real-time connection",
      });
    });

    // Handle user-specific events
    wsClient.on('user_updated', (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    });

    wsClient.on('force_logout', (reason: string) => {
      toast({
        variant: "destructive",
        title: "Session Ended",
        description: reason || "You have been logged out",
      });
      logout();
    });
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: loggedInUser, token } = await api.login(email, password);
      
      setUser(loggedInUser);
      
      // Connect WebSocket
      await wsClient.connect(token);
      setupWebSocketListeners();
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${loggedInUser.nickname}`,
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, nickname: string) => {
    try {
      setIsLoading(true);
      const { user: newUser, token } = await api.register(email, password, nickname);
      
      setUser(newUser);
      
      // Connect WebSocket
      await wsClient.connect(token);
      setupWebSocketListeners();
      
      toast({
        title: "Account Created!",
        description: `Welcome to SecureChat, ${newUser.nickname}!`,
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createAnonymousSession = async (nickname: string, preferences = {}) => {
    try {
      setIsLoading(true);
      const { user: anonUser, token } = await api.createAnonymousSession(nickname, preferences);
      
      setUser(anonUser);
      
      // Connect WebSocket
      await wsClient.connect(token);
      setupWebSocketListeners();
      
      toast({
        title: "Anonymous Session Created",
        description: `Welcome, ${anonUser.nickname}! Your session is secure and private.`,
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to create anonymous session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Disconnect WebSocket first
      wsClient.disconnect();
      
      // Logout from server
      await api.logout();
      
      // Clear local state
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been safely logged out",
      });
      
    } catch (error) {
      // Even if logout fails on server, clear local state
      api.clearAuth();
      setUser(null);
      wsClient.disconnect();
      
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      const { preferences: updatedPreferences } = await api.updatePreferences(preferences);
      
      if (user) {
        const updatedUser = {
          ...user,
          preferences: updatedPreferences
        };
        setUser(updatedUser);
      }
      
      toast({
        title: "Preferences Updated",
        description: "Your settings have been saved",
      });
      
    } catch (error) {
      handleAPIError(error as Error, "Failed to update preferences");
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { valid, user: refreshedUser } = await api.verifyToken();
      
      if (valid && refreshedUser) {
        setUser(refreshedUser);
      } else {
        // Token is invalid, logout
        await logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await api.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Update user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      if (wsClient.isConnected()) {
        wsClient.emit('user_activity', {});
      }
    };

    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Send periodic activity updates
    const activityInterval = setInterval(updateActivity, 60000); // Every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(activityInterval);
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    createAnonymousSession,
    logout,
    updatePreferences,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
