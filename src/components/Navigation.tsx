import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  Home, 
  Settings, 
  Users, 
  MessageCircle, 
  FileText, 
  Lock, 
  Globe, 
  User, 
  LogOut,
  Bell,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NotificationCenter from '@/components/NotificationCenter';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [isStealthMode, setIsStealthMode] = useState(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user preferences for stealth mode
  useEffect(() => {
    if (user?.preferences) {
      setIsStealthMode(user.preferences.theme === 'stealth');
    }
  }, [user]);

  // Mock notifications (in real app, this would come from WebSocket)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setNotifications(prev => Math.floor(Math.random() * 5));
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been safely logged out",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleStealth = () => {
    setIsStealthMode(!isStealthMode);
    toast({
      title: isStealthMode ? "Stealth Mode Disabled" : "Stealth Mode Enabled",
      description: isStealthMode 
        ? "Normal interface restored" 
        : "Interface disguised for privacy",
    });
  };

  // Navigation items based on authentication status
  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'How It Works', href: '/how-it-works', icon: Settings },
    { name: 'Features', href: '/features', icon: Shield },
    { name: 'Join Room', href: '/join', icon: Users },
    { name: 'FAQ', href: '/faq', icon: FileText },
    { name: 'Contact', href: '/contact', icon: MessageCircle }
  ];

  const authenticatedNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Create Room', href: '/create', icon: Lock },
    { name: 'File Share', href: '/files', icon: FileText },
    { name: 'Manage Rooms', href: '/rooms', icon: Settings },
    { name: 'Underground', href: '/underground', icon: Globe, badge: 'Pro' }
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  // User status indicator
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'invisible': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Generate user initials
  const getUserInitials = (nickname: string) => {
    return nickname
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Shield className={`h-8 w-8 transition-all duration-300 ${
                isStealthMode ? 'text-gray-500' : 'text-primary group-hover:text-accent'
              }`} />
              {isAuthenticated && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className={`text-xl lg:text-2xl font-bold transition-colors ${
              isStealthMode ? 'text-gray-600' : 'text-foreground group-hover:text-primary'
            }`}>
              {isStealthMode ? 'Calculator Pro' : 'SecureChat'}
            </span>
            {user && (
              <Badge variant="secondary" className="hidden lg:inline-flex text-xs">
                v2.1.0
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative group ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Live Status Indicator */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-4">
                {/* Real-time Notifications */}
                <NotificationCenter />

                {/* Connection Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">Live</span>
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getUserInitials(user?.nickname || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                      getStatusColor(user?.status || 'offline')
                    }`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.isAnonymous ? 'Anonymous Session' : user?.email}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(user?.status || 'offline')}`} />
                        <span className="capitalize">{user?.status || 'offline'}</span>
                        {user?.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/app-modes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    App Modes
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={toggleStealth}>
                    {isStealthMode ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    {isStealthMode ? 'Disable Stealth' : 'Enable Stealth'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/join')}
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Room
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-accent/20 text-accent ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {!isAuthenticated && (
                <div className="pt-3 border-t border-border/50 mt-3">
                  <Link
                    to="/auth"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-3 border-t border-border/50 mt-3 space-y-1">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getUserInitials(user?.nickname || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.isAnonymous ? 'Anonymous' : 'Registered'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(user?.status || 'offline')}`} />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 w-full text-left rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
