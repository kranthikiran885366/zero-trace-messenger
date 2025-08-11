import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Zap, Lock, Activity, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAuth } from './UserAuth';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { session } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: null },
    { href: '/how-it-works', label: 'How It Works', icon: null },
    { href: '/features', label: 'Features', icon: null },
    { href: '/join', label: 'Join Room', icon: Lock },
    { href: '/create', label: 'Create Room', icon: Zap },
    { href: '/files', label: 'File Share', icon: null },
    { href: '/manage', label: 'Manage Rooms', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg shadow-primary/10' 
          : 'bg-card/80 backdrop-blur-sm border-b border-border/30'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 font-bold text-xl group transition-all duration-300 hover:scale-105"
              onClick={closeMenu}
            >
              <div className="relative">
                <Shield className="h-7 w-7 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:text-accent" />
                <div className="absolute inset-0 h-7 w-7 bg-primary/20 rounded-full blur-md group-hover:bg-accent/30 transition-all duration-300" />
              </div>
              <span className="gradient-neon bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                SecureChat
              </span>
              <Badge variant="secondary" className="hidden sm:inline-flex bg-primary/10 text-primary text-xs animate-pulse">
                v2.0
              </Badge>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </div>
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                  )}
                  <div className="absolute inset-0 rounded-lg bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {/* Live Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/50 px-3 py-1 rounded-full border border-border/50">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-neon-green" />
                  <span className="text-neon-green animate-pulse">LIVE</span>
                </div>
                <span>•</span>
                <span>147 rooms</span>
              </div>

              {/* User Session */}
              {session ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-primary/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{session.nickname}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                      <Link 
                        to="/auth" 
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Session Settings
                      </Link>
                      <hr className="my-1 border-border" />
                      <button 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                        onClick={() => {
                          setShowUserMenu(false);
                          // Add logout logic here
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        End Session
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                  <Link to="/auth">
                    <User className="mr-2 h-4 w-4" />
                    Session
                  </Link>
                </Button>
              )}

              <Button variant="outline" size="sm" asChild className="hover:bg-accent/10 hover:border-accent/50">
                <Link to="/join">
                  <Lock className="mr-2 h-4 w-4" />
                  Join Room
                </Link>
              </Button>
              
              <Button variant="cyber" size="sm" asChild className="animate-glow-pulse">
                <Link to="/create">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Chat
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-primary/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-lg z-50 animate-fade-in-up">
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Live Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-full border border-border/50 mb-6">
                <Activity className="h-4 w-4 text-neon-green" />
                <span className="text-neon-green animate-pulse">LIVE</span>
                <span>•</span>
                <span>147 active rooms</span>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 mb-8">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-lg ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10 border border-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    {item.label}
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Session Info */}
              {session && (
                <div className="mb-6 p-4 bg-card/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{session.nickname}</p>
                      <p className="text-xs text-muted-foreground">Active Session</p>
                    </div>
                  </div>
                  <Link 
                    to="/auth" 
                    onClick={closeMenu}
                    className="text-sm text-primary hover:underline"
                  >
                    Manage Session →
                  </Link>
                </div>
              )}

              {/* Mobile CTA Buttons */}
              <div className="space-y-3">
                <Button variant="outline" asChild className="w-full justify-start" onClick={closeMenu}>
                  <Link to="/join">
                    <Lock className="mr-2 h-4 w-4" />
                    Join Room
                  </Link>
                </Button>
                <Button variant="cyber" asChild className="w-full justify-start" onClick={closeMenu}>
                  <Link to="/create">
                    <Zap className="mr-2 h-4 w-4" />
                    Start Secure Chat
                  </Link>
                </Button>
                {!session && (
                  <Button variant="ghost" asChild className="w-full justify-start" onClick={closeMenu}>
                    <Link to="/auth">
                      <User className="mr-2 h-4 w-4" />
                      Create Session
                    </Link>
                  </Button>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  🔐 Secure • 🌐 Anonymous • 🚫 No Logs
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />

      {/* Close mobile menu on outside click */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default Navigation;
