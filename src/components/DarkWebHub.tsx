import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Globe, Eye, EyeOff, Zap, Lock, Skull, Terminal, Wifi, WifiOff, Layers, Key, Bitcoin, Package, Users, MessageCircle, Search, Filter, Star, AlertTriangle, Clock, MapPin, Activity, Cpu, HardDrive, Network, Signal, Radar, Router, MonitorSpeaker } from 'lucide-react';
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
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border-red-500/30 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <CardHeader className="text-center relative">
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

              <Card className="bg-gradient-to-br from-purple-900/20 to-black/50 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Package className="h-5 w-5" />
                    Underground Market
                  </CardTitle>
                  <CardDescription>
                    Anonymous marketplace for digital services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full bg-purple-500/20 hover:bg-purple-500/30" 
                    onClick={accessMarketplace}
                  >
                    Access Marketplace
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-black/50 border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <MapPin className="h-5 w-5" />
                    Dead Drops
                  </CardTitle>
                  <CardDescription>
                    Physical location-based secure messaging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full bg-green-500/20 hover:bg-green-500/30" 
                    onClick={createDeadDrop}
                  >
                    Create Drop Point
                  </Button>
                </CardContent>
              </Card>
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
                  <Badge variant="destructive">⚠️ Use at your own risk</Badge>
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
                            <div className="flex items-center gap-4 text-sm">
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
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Physical Dead Drops
                </CardTitle>
                <CardDescription>
                  Secure physical message drops in real locations
                </CardDescription>
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
                            <Badge variant={drop.retrieved ? "secondary" : "destructive"}>
                              {drop.retrieved ? 'Retrieved' : 'Active'}
                            </Badge>
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
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-500" />
                  Decentralized Mesh Network
                </CardTitle>
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

          {/* Terminal Tab */}
          <TabsContent value="terminal" className="space-y-6">
            <Card className="bg-black border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500 font-mono">
                  <Terminal className="h-5 w-5" />
                  [root@underground]#
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-green-500 space-y-2 text-sm">
                  <div>$ tor --version</div>
                  <div className="text-green-400">Tor version 0.4.7.13 (git-2f8a3f1)</div>
                  <div>$ onion-routing status</div>
                  <div className="text-green-400">[✓] 3-hop circuit established</div>
                  <div className="text-green-400">[✓] End-to-end encryption active</div>
                  <div className="text-green-400">[✓] IP address masked</div>
                  <div>$ mesh-network peers</div>
                  <div className="text-green-400">Connected peers: {meshConnections}</div>
                  <div>$ encryption-status</div>
                  <div className="text-green-400">AES-256-GCM: ACTIVE</div>
                  <div className="text-green-400">RSA-4096: ACTIVE</div>
                  <div className="text-green-400">ChaCha20-Poly1305: ACTIVE</div>
                  <div>$ steganography ready</div>
                  <div className="text-green-400">[✓] Image hiding protocols loaded</div>
                  <div className="text-green-400">[✓] Audio masking available</div>
                  <div>$ _</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Warning Footer */}
        <Card className="bg-red-900/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-400 font-semibold">⚠️ WARNING: UNDERGROUND ZONE ⚠️</p>
            <p className="text-sm text-muted-foreground mt-2">
              These tools are for educational purposes only. Use responsibly and in accordance with local laws.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DarkWebHub;
