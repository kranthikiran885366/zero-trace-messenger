import { useState, useEffect } from 'react';
import { Search, Home, ArrowLeft, Shield, Zap, MessageSquare, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    {
      title: 'Create Secure Room',
      description: 'Start a new encrypted chat session',
      path: '/create',
      icon: Shield,
      color: 'text-primary'
    },
    {
      title: 'Join Existing Room',
      description: 'Enter a room with a code',
      path: '/join',
      icon: MessageSquare,
      color: 'text-accent'
    },
    {
      title: 'How It Works',
      description: 'Learn about our security features',
      path: '/how-it-works',
      icon: Eye,
      color: 'text-neon-green'
    },
    {
      title: 'Features Overview',
      description: 'Explore all privacy features',
      path: '/features',
      icon: Zap,
      color: 'text-neon-purple'
    }
  ];

  const commonPages = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create Room' },
    { path: '/join', label: 'Join Room' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/features', label: 'Features' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
    { path: '/underground', label: 'Underground Hub' },
    { path: '/files', label: 'File Share' },
    { path: '/manage', label: 'Room Manager' },
    { path: '/auth', label: 'Session Management' }
  ];

  const filteredPages = commonPages.filter(page =>
    page.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      navigate(filteredPages[0].path);
    }
  };

  // Check if the URL might be a room code
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const possibleRoomCode = pathSegments[pathSegments.length - 1];
  const isRoomCodeLike = possibleRoomCode && possibleRoomCode.length >= 8 && /^[A-Za-z0-9]+$/.test(possibleRoomCode);

  useEffect(() => {
    // Hide suggestions after some time
    const timer = setTimeout(() => {
      setShowSuggestions(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main 404 Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* 404 Display */}
            <div className="space-y-6">
              <div className="text-8xl lg:text-9xl font-bold">
                <span className="text-red-500 animate-pulse">4</span>
                <span className="text-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }}>0</span>
                <span className="text-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}>4</span>
              </div>
              
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-lg px-4 py-2">
                ⚠️ Page Not Found
              </Badge>
              
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                <span className="text-foreground">This page has been </span>
                <span className="gradient-neon bg-clip-text text-transparent">anonymized</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                The page you're looking for doesn't exist or has been moved for security reasons. 
                {isRoomCodeLike && " Or maybe you're trying to access a secure room?"}
              </p>
            </div>

            {/* Room Code Detection */}
            {isRoomCodeLike && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20 max-w-lg mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Room Code Detected
                  </CardTitle>
                  <CardDescription>
                    It looks like you might be trying to access a secure room
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-mono">{possibleRoomCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="cyber" asChild className="flex-1">
                      <Link to={`/chat/${possibleRoomCode}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Try Chat Room
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to={`/video/${possibleRoomCode}`}>
                        <Shield className="mr-2 h-4 w-4" />
                        Try Video Room
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Find What You're Looking For</CardTitle>
                <CardDescription>
                  Search for pages or use the suggestions below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Search Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    Search Pages
                  </Button>
                </form>

                {/* Search Results */}
                {searchTerm && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Search Results:</h4>
                    {filteredPages.length > 0 ? (
                      <div className="space-y-2">
                        {filteredPages.slice(0, 5).map((page) => (
                          <Link 
                            key={page.path}
                            to={page.path}
                            className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="font-medium">{page.label}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{page.path}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No pages found matching your search.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      {showSuggestions && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Popular Destinations</h2>
                <p className="text-lg text-muted-foreground">
                  Maybe you were looking for one of these?
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index} 
                    className="group bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(suggestion.path)}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <suggestion.icon className={`h-6 w-6 ${suggestion.color}`} />
                      </div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                        Visit Page
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Pages List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">All Available Pages</h2>
              <p className="text-muted-foreground">
                Complete list of SecureChat pages and features
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonPages.map((page) => (
                <Link 
                  key={page.path}
                  to={page.path}
                  className="flex items-center gap-3 p-4 bg-card/50 hover:bg-card/70 rounded-lg transition-all duration-300 border border-border hover:border-primary/50"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">{page.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto font-mono">{page.path}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-16 bg-red-900/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-red-900/20 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-2">Security Notice</h3>
                    <p className="text-sm text-foreground/80">
                      If you believe you should have access to this page, it may have been moved or restricted 
                      for security reasons. Some features require specific access codes or may be temporarily unavailable 
                      during security updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
