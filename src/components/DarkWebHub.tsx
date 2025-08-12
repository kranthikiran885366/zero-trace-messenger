import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Globe, Eye, EyeOff, Zap, Lock, Skull, Terminal, Wifi, WifiOff, Layers, Key, Bitcoin, Package, Users, MessageCircle, Search, Filter, Star, AlertTriangle, Clock, MapPin, Activity, Cpu, HardDrive, Network, Signal, Radar, Router, MonitorSpeaker, ArrowLeft, Home, Settings, Power, RefreshCw, Download, Upload, Trash2, Save, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SteganographyTool from './SteganographyTool';
import CryptoMixer from './CryptoMixer';

interface OnionLayer {
  id: string;
  country: string;
  server: string;
  latency: number;
  encryption: string;
}

interface MarketListing {
  id: string;
  title: string;
  category: string;
  vendor: string;
  rating: number;
  price: string;
  currency: 'BTC' | 'XMR' | 'ZEC';
  escrow: boolean;
  shipping: string;
  views: number;
  sales: number;
}

interface DeadDrop {
  id: string;
  location: string;
  coordinates: string;
  message: string;
  expiresAt: number;
  retrieved: boolean;
  encrypted: boolean;
}

const DarkWebHub = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLCanvasElement>(null);

  const [onionRouting, setOnionRouting] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState('AES-256');
  const [currentTorCircuit, setCurrentTorCircuit] = useState<OnionLayer[]>([]);
  const [meshConnections, setMeshConnections] = useState(0);
  const [activeTab, setActiveTab] = useState('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    ram: 0,
    network: 0,
    encrypted: 0
  });
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [matrixActive, setMatrixActive] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  const [marketListings] = useState<MarketListing[]>([
    {
      id: '1',
      title: 'Ultra-Secure VPN Credentials',
      category: 'Digital Services',
      vendor: 'CyberGhost_007',
      rating: 4.8,
      price: '0.005',
      currency: 'BTC',
      escrow: true,
      shipping: 'Digital Delivery',
      views: 847,
      sales: 156
    },
    {
      id: '2',
      title: 'Anonymous Phone Numbers',
      category: 'Communication',
      vendor: 'PhantomComms',
      rating: 4.9,
      price: '0.002',
      currency: 'XMR',
      escrow: true,
      shipping: 'Instant',
      views: 1203,
      sales: 289
    },
    {
      id: '3',
      title: 'Encrypted Data Storage',
      category: 'Digital Services',
      vendor: 'VaultKeeper',
      rating: 4.7,
      price: '0.01',
      currency: 'ZEC',
      escrow: true,
      shipping: 'Digital',
      views: 562,
      sales: 78
    }
  ]);

  const [deadDrops] = useState<DeadDrop[]>([
    {
      id: '1',
      location: 'Central Park, NYC',
      coordinates: '40.7829° N, 73.9654° W',
      message: 'Package left behind the oak tree near Bethesda Fountain',
      expiresAt: Date.now() + 86400000,
      retrieved: false,
      encrypted: true
    },
    {
      id: '2',
      location: 'London Bridge, UK',
      coordinates: '51.5074° N, 0.1278° W',
      message: 'USB drive hidden in maintenance box',
      expiresAt: Date.now() + 43200000,
      retrieved: false,
      encrypted: true
    }
  ]);

  const onionLayers: OnionLayer[] = [
    { id: '1', country: 'Unknown', server: 'Entry Node', latency: 45, encryption: 'RSA-4096' },
    { id: '2', country: 'Unknown', server: 'Middle Relay', latency: 78, encryption: 'AES-256' },
    { id: '3', country: 'Unknown', server: 'Exit Node', latency: 92, encryption: 'ChaCha20' }
  ];

  // Matrix Rain Effect
  useEffect(() => {
    if (!matrixRef.current || !matrixActive) return;

    const canvas = matrixRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [matrixActive]);

  // System Stats Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        encrypted: Math.floor(85 + Math.random() * 15)
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Terminal Typewriter Effect
  const addTerminalLine = useCallback((line: string) => {
    setTerminalLines(prev => [...prev.slice(-10), line]);
  }, []);

  useEffect(() => {
    const commands = [
      'Initializing dark web protocols...',
      'Establishing encrypted tunnels...',
      'Tor circuit: 3 hops configured',
      'Steganography modules loaded',
      'Crypto mixer: ready for operations',
      'Mesh network: scanning for peers...',
      'Anonymous mode: ACTIVE',
      'All systems operational'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < commands.length) {
        addTerminalLine(`$ ${commands[index]}`);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [addTerminalLine]);

  useEffect(() => {
    if (onionRouting) {
      setCurrentTorCircuit(onionLayers);
      const interval = setInterval(() => {
        setMeshConnections(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setCurrentTorCircuit([]);
      setMeshConnections(0);
    }
  }, [onionRouting]);

  const initializeOnionRouting = () => {
    setIsScanning(true);
    addTerminalLine('$ tor --enable-routing');

    setTimeout(() => {
      setOnionRouting(true);
      setMeshConnections(7);
      setIsScanning(false);
      addTerminalLine('✓ Onion routing established');
      toast({
        title: "🧅 Onion Routing Activated",
        description: "Your traffic is now routing through multiple encrypted layers",
      });
    }, 3000);
  };

  const createDeadDrop = () => {
    toast({
      title: "📍 Dead Drop Created",
      description: "Location coordinates have been encrypted and stored",
    });
  };

  const accessMarketplace = () => {
    toast({
      title: "🏪 Accessing Underground Marketplace",
      description: "Welcome to the anonymous digital bazaar",
    });
  };

  const categories = [
    'all',
    'Digital Services',
    'Communication',
    'Security Tools',
    'Anonymous Banking',
    'Data Services'
  ];

  const filteredListings = marketListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Matrix Rain Background */}
      <canvas
        ref={matrixRef}
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{ filter: 'brightness(0.5)' }}
      />

      {/* Scanning Effect */}
      {isScanning && (
        <div className="fixed inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-green-500/5">
            <div className="h-1 bg-green-500 animate-pulse"
                 style={{
                   animation: 'scan 2s linear infinite',
                   background: 'linear-gradient(90deg, transparent, #22c55e, transparent)'
                 }} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-20">

        {/* Navigation Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="bg-red-900/20 border-red-500/50 hover:bg-red-800/30 hover:border-red-400/70 text-red-400 hover:text-red-300 transition-all duration-300 shadow-lg shadow-red-500/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              EXIT UNDERGROUND
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="bg-cyan-900/20 border-cyan-500/50 hover:bg-cyan-800/30 hover:border-cyan-400/70 text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              <Home className="h-5 w-5 mr-2" />
              SECURE HOME
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMatrixActive(!matrixActive);
                toast({
                  title: `Matrix Effect ${matrixActive ? 'Disabled' : 'Enabled'}`,
                  description: `Background effects ${matrixActive ? 'turned off' : 'activated'}`
                });
              }}
              className="bg-green-900/20 border-green-500/50 hover:bg-green-800/30 text-green-400"
            >
              <Eye className="h-4 w-4 mr-1" />
              MATRIX
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOnionRouting(false);
                setMeshConnections(0);
                setTerminalLines([]);
                toast({
                  title: "⚠️ Emergency Protocol",
                  description: "All connections terminated. System cleared.",
                  variant: "destructive"
                });
              }}
              className="bg-red-900/20 border-red-500/50 hover:bg-red-800/30 text-red-400"
            >
              <Power className="h-4 w-4 mr-1" />
              KILL SWITCH
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('hub');
                window.location.reload();
              }}
              className="bg-purple-900/20 border-purple-500/50 hover:bg-purple-800/30 text-purple-400"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              REFRESH
            </Button>
          </div>
        </div>
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border-red-500/30 backdrop-blur-sm relative overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/2538122/pexels-photo-2538122.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Underground dark web background"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-black/60 to-purple-900/50" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
          <CardHeader className="text-center relative z-20">
            <CardTitle className="text-5xl flex items-center justify-center gap-4 mb-2">
              <div className="relative">
                <Skull className="h-12 w-12 text-red-500 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-red-500/30 animate-ping" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient bg-300% font-bold">
                UNDERGROUND HUB
              </span>
              <div className="relative">
                <Terminal className="h-12 w-12 text-green-500 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-green-500/30 animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground mb-4">
              <span className="inline-block animate-typewriter">
                Maximum anonymity tools for the digital underground
              </span>
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-red-500/20 text-red-400 animate-pulse border border-red-500/50 px-4 py-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                HIGH RISK ZONE
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-4 py-2">
                <Lock className="h-4 w-4 mr-2" />
                MILITARY GRADE
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border border-green-500/50 px-4 py-2">
                <Globe className="h-4 w-4 mr-2" />
                GLOBAL NETWORK
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced System Status Dashboard */}
        <Card className="bg-card/30 backdrop-blur-md border border-green-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-green-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                SYSTEM STATUS DASHBOARD
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-500 font-mono">OPERATIONAL</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Onion Routing Status */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {onionRouting ? (
                      <div className="flex items-center justify-center">
                        <span className="animate-spin-slow">🧅</span>
                        <div className="absolute h-8 w-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <span className="text-red-500">⭕</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">ONION ROUTING</div>
                  <div className="text-xs font-mono mt-1">
                    <span className={onionRouting ? 'text-green-400' : 'text-red-400'}>
                      {onionRouting ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  {onionRouting && (
                    <div className="mt-2 h-1 bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '85%' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Mesh Network */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-blue-500 mb-2 flex items-center justify-center">
                    <Network className="h-8 w-8 animate-pulse" />
                    <span className="ml-2">{meshConnections}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">MESH NODES</div>
                  <div className="text-xs text-blue-400 font-mono mt-1">CONNECTED</div>
                  <div className="mt-2 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: `${Math.min(100, meshConnections * 10)}%` }} />
                  </div>
                </div>
              </div>

              {/* Encryption Level */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                  <div className="text-2xl font-bold text-purple-500 mb-2 flex items-center justify-center">
                    <Shield className="h-6 w-6 mr-2 animate-pulse" />
                    <span className="text-lg">{encryptionLevel}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">ENCRYPTION</div>
                  <div className="text-xs text-purple-400 font-mono mt-1">ACTIVE</div>
                  <div className="mt-2 h-1 bg-purple-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Tor Circuit Hops */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-red-500 mb-2 flex items-center justify-center">
                    <Layers className="h-8 w-8 mr-2 animate-pulse" />
                    <span>{currentTorCircuit.length}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">TOR HOPS</div>
                  <div className="text-xs text-red-400 font-mono mt-1">LAYERS</div>
                  <div className="mt-2 h-1 bg-red-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: `${currentTorCircuit.length * 33}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced System Metrics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-mono text-green-400">CPU</span>
                </div>
                <div className="text-lg font-bold text-green-500">{systemStats.cpu}%</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-mono text-blue-400">RAM</span>
                </div>
                <div className="text-lg font-bold text-blue-500">{systemStats.ram}%</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Signal className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-mono text-purple-400">NET</span>
                </div>
                <div className="text-lg font-bold text-purple-500">{systemStats.network}%</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 rounded border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-mono text-yellow-400">ENC</span>
                </div>
                <div className="text-lg font-bold text-yellow-500">{systemStats.encrypted}%</div>
              </div>
            </div>

            {/* Live Terminal Feed */}
            <div className="mt-6">
              <div className="bg-black/80 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-mono text-green-400">LIVE SYSTEM LOG</span>
                  <div className="ml-auto h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="space-y-1 max-h-24 overflow-hidden">
                  {terminalLines.slice(-3).map((line, index) => (
                    <div key={index} className="text-xs font-mono text-green-400 opacity-80">
                      {line}
                    </div>
                  ))}
                  <div className="text-xs font-mono text-green-500 animate-pulse">█</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="hub">🏠 Hub</TabsTrigger>
            <TabsTrigger value="onion">🧅 Routing</TabsTrigger>
            <TabsTrigger value="marketplace">🏪 Market</TabsTrigger>
            <TabsTrigger value="deaddrops">📍 Drops</TabsTrigger>
            <TabsTrigger value="mesh">🕸️ Mesh</TabsTrigger>
            <TabsTrigger value="crypto">₿ Mixer</TabsTrigger>
            <TabsTrigger value="stego">👁️ Stego</TabsTrigger>
            <TabsTrigger value="terminal">💻 Terminal</TabsTrigger>
          </TabsList>

          {/* Enhanced Hub Tab */}
          <TabsContent value="hub" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-900/30 to-black/70 border-red-500/40 hover:border-red-400/60 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-red-400 group-hover:text-red-300 transition-colors">
                    <div className="relative">
                      <Globe className="h-6 w-6 group-hover:animate-spin" />
                      <div className="absolute inset-0 h-6 w-6 border border-red-500/50 rounded-full animate-ping" />
                    </div>
                    <span className="text-lg font-bold">ONION ROUTING</span>
                  </CardTitle>
                  <CardDescription className="text-red-300/70">
                    Multi-layer anonymous routing through global darknet infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Security Level:</span>
                      <span className="text-red-300 font-mono">MAXIMUM</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Anonymity:</span>
                      <span className="text-red-300 font-mono">99.9%</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600/80 hover:bg-red-500/90 border border-red-500/50 shadow-lg shadow-red-500/20"
                    onClick={initializeOnionRouting}
                    disabled={onionRouting || isScanning}
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-2">
                        <Radar className="h-4 w-4 animate-spin" />
                        SCANNING NODES...
                      </span>
                    ) : onionRouting ? (
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        CIRCUIT ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        INITIALIZE NETWORK
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-black/70 border-purple-500/40 hover:border-purple-400/60 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-purple-400 group-hover:text-purple-300 transition-colors">
                    <div className="relative">
                      <Package className="h-6 w-6 group-hover:animate-bounce" />
                      <div className="absolute inset-0 h-6 w-6 border border-purple-500/50 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-lg font-bold">UNDERGROUND MARKET</span>
                  </CardTitle>
                  <CardDescription className="text-purple-300/70">
                    Anonymous digital bazaar with escrow protection and encrypted communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-400">Active Vendors:</span>
                      <span className="text-purple-300 font-mono">1,247</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-400">Escrow Security:</span>
                      <span className="text-purple-300 font-mono">100%</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full bg-purple-600/80 hover:bg-purple-500/90 border border-purple-500/50 shadow-lg shadow-purple-500/20 text-purple-100"
                    onClick={accessMarketplace}
                  >
                    <span className="flex items-center gap-2">
                      <Bitcoin className="h-4 w-4" />
                      ACCESS MARKETPLACE
                    </span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/30 to-black/70 border-green-500/40 hover:border-green-400/60 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-green-400 group-hover:text-green-300 transition-colors">
                    <div className="relative">
                      <MapPin className="h-6 w-6 group-hover:animate-pulse" />
                      <div className="absolute inset-0 h-6 w-6 border border-green-500/50 rounded-full animate-ping" style={{ animationDelay: '0.7s' }} />
                    </div>
                    <span className="text-lg font-bold">DEAD DROPS</span>
                  </CardTitle>
                  <CardDescription className="text-green-300/70">
                    Physical location-based secure messaging with GPS encryption
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Active Drops:</span>
                      <span className="text-green-300 font-mono">2 LIVE</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Encryption:</span>
                      <span className="text-green-300 font-mono">AES-256</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full bg-green-600/80 hover:bg-green-500/90 border border-green-500/50 shadow-lg shadow-green-500/20 text-green-100"
                    onClick={createDeadDrop}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      CREATE DROP POINT
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions with Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card
                className="bg-gradient-to-br from-cyan-900/20 to-black/50 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('mesh')}
              >
                <CardContent className="p-4 text-center">
                  <Wifi className="h-8 w-8 mx-auto text-cyan-400 mb-2 group-hover:animate-pulse" />
                  <div className="text-sm font-semibold text-cyan-400">MESH NETWORK</div>
                  <div className="text-xs text-cyan-300/70 mt-1">{meshConnections} nodes</div>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('mesh');
                    }}
                  >
                    CONNECT
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-yellow-900/20 to-black/50 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('crypto')}
              >
                <CardContent className="p-4 text-center">
                  <Bitcoin className="h-8 w-8 mx-auto text-yellow-400 mb-2 group-hover:animate-bounce" />
                  <div className="text-sm font-semibold text-yellow-400">CRYPTO MIXER</div>
                  <div className="text-xs text-yellow-300/70 mt-1">Anonymous</div>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('crypto');
                    }}
                  >
                    MIX COINS
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-indigo-900/20 to-black/50 border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('stego')}
              >
                <CardContent className="p-4 text-center">
                  <Eye className="h-8 w-8 mx-auto text-indigo-400 mb-2 group-hover:animate-pulse" />
                  <div className="text-sm font-semibold text-indigo-400">STEGANOGRAPHY</div>
                  <div className="text-xs text-indigo-300/70 mt-1">Hide data</div>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-500/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('stego');
                    }}
                  >
                    HIDE DATA
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-orange-900/20 to-black/50 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('terminal')}
              >
                <CardContent className="p-4 text-center">
                  <Terminal className="h-8 w-8 mx-auto text-orange-400 mb-2 group-hover:animate-pulse" />
                  <div className="text-sm font-semibold text-orange-400">TERMINAL</div>
                  <div className="text-xs text-orange-300/70 mt-1">Command line</div>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('terminal');
                    }}
                  >
                    ACCESS
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 p-4 bg-gradient-to-r from-gray-900/20 to-black/40 rounded-lg border border-gray-500/20">
              <Button
                variant="outline"
                onClick={() => setActiveTab('marketplace')}
                className="bg-purple-900/20 border-purple-500/50 hover:bg-purple-800/30 text-purple-400"
              >
                <Package className="h-4 w-4 mr-2" />
                ACCESS MARKET
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveTab('deaddrops')}
                className="bg-green-900/20 border-green-500/50 hover:bg-green-800/30 text-green-400"
              >
                <MapPin className="h-4 w-4 mr-2" />
                CREATE DROP
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveTab('onion')}
                className="bg-red-900/20 border-red-500/50 hover:bg-red-800/30 text-red-400"
              >
                <Globe className="h-4 w-4 mr-2" />
                ONION ROUTING
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const data = {
                    onionRouting,
                    meshConnections,
                    systemStats,
                    timestamp: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'underground-session.json';
                  a.click();
                  toast({
                    title: "📱 Session Exported",
                    description: "Underground session data has been encrypted and downloaded"
                  });
                }}
                className="bg-blue-900/20 border-blue-500/50 hover:bg-blue-800/30 text-blue-400"
              >
                <Download className="h-4 w-4 mr-2" />
                EXPORT SESSION
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('⚠️ This will wipe all session data. Continue?')) {
                    setOnionRouting(false);
                    setMeshConnections(0);
                    setTerminalLines([]);
                    setSystemStats({ cpu: 0, ram: 0, network: 0, encrypted: 0 });
                    toast({
                      title: "🗑️ Data Wiped",
                      description: "All session data has been securely deleted",
                      variant: "destructive"
                    });
                  }
                }}
                className="bg-red-900/20 border-red-500/50 hover:bg-red-800/30 text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                WIPE DATA
              </Button>
            </div>
          </TabsContent>

          {/* Onion Routing Tab */}
          <TabsContent value="onion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-orange-500" />
                  Tor Circuit Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTorCircuit.length > 0 ? (
                  <div className="space-y-4">
                    {currentTorCircuit.map((layer, index) => (
                      <div key={layer.id} className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
                        <div className="text-2xl">
                          {index === 0 ? '🖥️' : index === 1 ? '🌐' : '🚪'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{layer.server}</div>
                          <div className="text-sm text-muted-foreground">
                            {layer.country} • {layer.encryption} • {layer.latency}ms
                          </div>
                        </div>
                        <div className="text-green-500">
                          <Wifi className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Onion routing not active</p>
                    <Button 
                      variant="cyber" 
                      onClick={initializeOnionRouting}
                      className="mt-4"
                    >
                      Start Tor Circuit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    Underground Marketplace
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">⚠️ Use at your own risk</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('hub')}
                      className="bg-gray-900/20 border-gray-500/50 hover:bg-gray-800/30"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Hub
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{listing.category}</p>
                            <div className="flex items-center gap-4 text-sm mb-3">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {listing.vendor}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {listing.rating}
                              </span>
                              <span>{listing.views} views</span>
                              <span>{listing.sales} sales</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-orange-600/80 hover:bg-orange-500/90 text-orange-100"
                                onClick={() => toast({
                                  title: "🛒 Item Added to Cart",
                                  description: `${listing.title} - Secure checkout initiated`
                                })}
                              >
                                <Package className="h-3 w-3 mr-1" />
                                BUY NOW
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
                                onClick={() => toast({
                                  title: "💬 Vendor Contact",
                                  description: "Encrypted message channel opened"
                                })}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                CONTACT
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-500">
                              {listing.price} {listing.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">{listing.shipping}</div>
                            {listing.escrow && (
                              <Badge variant="secondary" className="mt-1">
                                🔒 Escrow
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dead Drops Tab */}
          <TabsContent value="deaddrops" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      Physical Dead Drops
                    </CardTitle>
                    <CardDescription>
                      Secure physical message drops in real locations
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600/80 hover:bg-green-500/90 text-green-100"
                      onClick={createDeadDrop}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      NEW DROP
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('hub')}
                      className="bg-gray-900/20 border-gray-500/50 hover:bg-gray-800/30"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deadDrops.map((drop) => (
                    <Card key={drop.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{drop.location}</h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              {drop.coordinates}
                            </p>
                            <p className="text-sm mt-2">{drop.message}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                {Math.floor((drop.expiresAt - Date.now()) / 3600000)}h left
                              </span>
                            </div>
                            <div className="space-y-2">
                              <Badge variant={drop.retrieved ? "secondary" : "destructive"}>
                                {drop.retrieved ? 'Retrieved' : 'Active'}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                                  onClick={() => toast({
                                    title: "📍 Location Verified",
                                    description: "GPS coordinates confirmed and encrypted"
                                  })}
                                >
                                  VERIFY
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                                  onClick={() => toast({
                                    title: "📱 Message Retrieved",
                                    description: "Encrypted payload downloaded securely"
                                  })}
                                >
                                  RETRIEVE
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mesh Network Tab */}
          <TabsContent value="mesh" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-500" />
                    Decentralized Mesh Network
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-600/80 hover:bg-blue-500/90 text-blue-100"
                      onClick={() => {
                        setMeshConnections(prev => prev + Math.floor(Math.random() * 3) + 1);
                        toast({
                          title: "🔗 New Node Connected",
                          description: "Mesh network expanded successfully"
                        });
                      }}
                    >
                      <Network className="h-4 w-4 mr-1" />
                      CONNECT NODE
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('hub')}
                      className="bg-gray-900/20 border-gray-500/50 hover:bg-gray-800/30"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🕸️</div>
                  <h3 className="text-xl font-semibold mb-2">Mesh Network Active</h3>
                  <p className="text-muted-foreground mb-4">
                    Connected to {meshConnections} nodes in the decentralized network
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-lg font-bold text-blue-500">{meshConnections}</div>
                      <div className="text-xs">Active Nodes</div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="text-lg font-bold text-green-500">Ultra Low</div>
                      <div className="text-xs">Latency</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <div className="text-lg font-bold text-purple-500">100%</div>
                      <div className="text-xs">Uptime</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crypto Mixer Tab */}
          <TabsContent value="crypto">
            <CryptoMixer />
          </TabsContent>

          {/* Steganography Tab */}
          <TabsContent value="stego">
            <SteganographyTool />
          </TabsContent>

          {/* Enhanced Terminal Tab */}
          <TabsContent value="terminal" className="space-y-6">
            <Card className="bg-black/95 border-green-500/50 shadow-2xl shadow-green-500/20">
              <CardHeader className="border-b border-green-500/30">
                <CardTitle className="flex items-center gap-3 text-green-500 font-mono">
                  <div className="relative">
                    <Terminal className="h-6 w-6 animate-pulse" />
                    <div className="absolute inset-0 h-6 w-6 border border-green-500/50 rounded animate-ping" />
                  </div>
                  <span>[root@underground-hub]#</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs">SECURE SHELL</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* System Information */}
                  <div className="font-mono text-green-500 space-y-1 text-sm">
                    <div className="text-green-400"># SYSTEM BOOT SEQUENCE COMPLETE</div>
                    <div className="text-green-400"># UNDERGROUND HUB v2.1.0 - OPERATIONAL</div>
                    <div className="border-t border-green-500/30 my-3"></div>
                  </div>

                  {/* Live Command Output */}
                  <div className="font-mono text-green-500 space-y-2 text-sm max-h-64 overflow-y-auto">
                    <div>$ tor --version</div>
                    <div className="text-green-400 ml-4">Tor version 0.4.7.13 (git-2f8a3f1) - SECURE</div>
                    <div className="text-green-400 ml-4">Platform: Linux x86_64</div>

                    <div className="mt-3">$ onion-routing status</div>
                    <div className="text-green-400 ml-4">[✓] 3-hop circuit established</div>
                    <div className="text-green-400 ml-4">[✓] End-to-end encryption active (AES-256)</div>
                    <div className="text-green-400 ml-4">[✓] IP address masked - {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</div>
                    <div className="text-green-400 ml-4">[✓] DNS requests routed through Tor</div>

                    <div className="mt-3">$ mesh-network status</div>
                    <div className="text-green-400 ml-4">Connected peers: {meshConnections}</div>
                    <div className="text-green-400 ml-4">Network latency: {Math.floor(Math.random() * 50 + 10)}ms</div>
                    <div className="text-green-400 ml-4">Bandwidth: {Math.floor(Math.random() * 100 + 50)} MB/s</div>

                    <div className="mt-3">$ encryption-suite status</div>
                    <div className="text-green-400 ml-4">AES-256-GCM: ACTIVE</div>
                    <div className="text-green-400 ml-4">RSA-4096: ACTIVE</div>
                    <div className="text-green-400 ml-4">ChaCha20-Poly1305: ACTIVE</div>
                    <div className="text-green-400 ml-4">ECDH P-384: ACTIVE</div>

                    <div className="mt-3">$ steganography modules</div>
                    <div className="text-green-400 ml-4">[✓] Image hiding protocols loaded</div>
                    <div className="text-green-400 ml-4">[✓] Audio masking available</div>
                    <div className="text-green-400 ml-4">[✓] Video embedding ready</div>
                    <div className="text-green-400 ml-4">[✓] Text cipher modules active</div>

                    <div className="mt-3">$ crypto-mixer status</div>
                    <div className="text-green-400 ml-4">Bitcoin tumbler: ONLINE</div>
                    <div className="text-green-400 ml-4">Monero mixer: ONLINE</div>
                    <div className="text-green-400 ml-4">Zcash anonymizer: ONLINE</div>

                    <div className="mt-3">$ deadrop-network scan</div>
                    <div className="text-green-400 ml-4">Active drops: {deadDrops.length}</div>
                    <div className="text-green-400 ml-4">Encrypted coordinates: SECURED</div>

                    <div className="mt-3">$ system-security audit</div>
                    <div className="text-green-400 ml-4">[✓] All connections encrypted</div>
                    <div className="text-green-400 ml-4">[✓] No logs retained</div>
                    <div className="text-green-400 ml-4">[✓] Memory wiped on disconnect</div>
                    <div className="text-green-400 ml-4">[✓] Kill switch armed</div>

                    {terminalLines.map((line, index) => (
                      <div key={index} className="text-green-400 ml-4 animate-fadeIn">{line}</div>
                    ))}

                    <div className="flex items-center mt-4">
                      <span>$ </span>
                      <div className="ml-1 h-4 w-2 bg-green-500 animate-pulse"></div>
                    </div>
                  </div>

                  {/* System Resources */}
                  <div className="border-t border-green-500/30 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-green-500 font-mono text-lg">{systemStats.cpu}%</div>
                        <div className="text-green-400 text-xs">CPU USAGE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-500 font-mono text-lg">{systemStats.ram}%</div>
                        <div className="text-green-400 text-xs">MEMORY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-500 font-mono text-lg">{systemStats.network}%</div>
                        <div className="text-green-400 text-xs">NETWORK</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-500 font-mono text-lg">{meshConnections}</div>
                        <div className="text-green-400 text-xs">NODES</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Warning Footer */}
        <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0">
            <div className="h-full w-1 bg-red-500 animate-pulse" />
            <div className="absolute top-0 right-0 h-full w-1 bg-red-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <CardContent className="p-6 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-4">
              <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
              <div className="text-2xl font-bold text-red-400 animate-pulse">⚠️ DANGER ZONE ⚠️</div>
              <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="space-y-2">
              <p className="text-red-400 font-bold text-lg">
                MAXIMUM SECURITY UNDERGROUND OPERATIONS
              </p>
              <p className="text-red-300/80 text-sm max-w-2xl mx-auto">
                These advanced cryptographic and anonymity tools are provided for educational and legitimate privacy purposes only.
                Users assume full responsibility for compliance with applicable laws and regulations.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-green-400">ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-400">ANONYMOUS</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-400">SECURE</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(40, end);
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .bg-300% {
          background-size: 300% 300%;
        }

        /* Glow effects */
        .glow-red {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
        }

        .glow-green {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }

        .glow-purple {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default DarkWebHub;
