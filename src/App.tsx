import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Import pages
import Index from '@/pages/Index';
import Features from '@/pages/Features';
import HowItWorks from '@/pages/HowItWorks';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import AppModes from '@/pages/AppModes';
import CreateRoom from '@/pages/CreateRoom';
import JoinRoom from '@/pages/JoinRoom';
import Chat from '@/pages/Chat';
import FileShare from '@/pages/FileShare';
import VideoCall from '@/pages/VideoCall';
import UserAuth from '@/pages/UserAuth';
import SignIn from '@/pages/SignIn';
import ForgotPassword from '@/pages/ForgotPassword';
import RoomManager from '@/pages/RoomManager';
import DarkWebHub from '@/pages/DarkWebHub';
import NotFound from '@/pages/NotFound';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h2 className="text-xl font-semibold">Loading SecureChat...</h2>
      <p className="text-muted-foreground">Establishing secure connection</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App routes component
const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/app-modes" element={<AppModes />} />
      <Route path="/auth" element={<UserAuth />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/join" element={<JoinRoom />} />

      {/* Protected routes */}
      <Route path="/create" element={
        <ProtectedRoute>
          <CreateRoom />
        </ProtectedRoute>
      } />
      
      <Route path="/chat/:roomId" element={
        <ProtectedRoute>
          <ChatProvider>
            <Chat />
          </ChatProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/files" element={
        <ProtectedRoute>
          <FileShare />
        </ProtectedRoute>
      } />
      
      <Route path="/video/:roomId" element={
        <ProtectedRoute>
          <VideoCall />
        </ProtectedRoute>
      } />
      
      <Route path="/rooms" element={
        <ProtectedRoute>
          <RoomManager />
        </ProtectedRoute>
      } />
      
      <Route path="/underground" element={
        <ProtectedRoute>
          <DarkWebHub />
        </ProtectedRoute>
      } />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Environment checker
const EnvironmentChecker: React.FC = () => {
  useEffect(() => {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('🔧 SecureChat running in development mode');
      console.log('API URL:', import.meta.env.VITE_API_URL || 'Using default API URL');
      console.log('WS URL:', import.meta.env.VITE_WS_URL || 'Using default WebSocket URL');
    }

    // Check for required environment variables
    const requiredEnvVars = ['VITE_API_URL', 'VITE_WS_URL'];
    const missingEnvVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName] && import.meta.env.PROD
    );

    if (missingEnvVars.length > 0 && import.meta.env.PROD) {
      console.error('⚠️ Missing required environment variables:', missingEnvVars);
    }

    // Service worker registration for PWA features
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }

    // Check for WebRTC support
    if (!window.RTCPeerConnection) {
      console.warn('⚠️ WebRTC not supported - video calls will be disabled');
    }

    // Check for WebSocket support
    if (!window.WebSocket) {
      console.error('❌ WebSocket not supported - real-time features will be disabled');
    }

    // Performance monitoring
    if (import.meta.env.DEV) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log(`📊 Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        // Performance Observer not supported
      }
    }
  }, []);

  return null;
};

// Main App component
const App: React.FC = () => {
  useEffect(() => {
    // Prevent context menu in production
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener('contextmenu', handleContextMenu);
      return () => document.removeEventListener('contextmenu', handleContextMenu);
    }
  }, []);

  useEffect(() => {
    // Disable certain keyboard shortcuts in production
    if (import.meta.env.PROD) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <EnvironmentChecker />
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
