import { useState, useEffect } from 'react';
import { Shield, Globe, Eye, EyeOff, Zap, Lock, Skull, Terminal, Wifi, WifiOff, Layers, Key, Bitcoin, Package, Users, MessageCircle, Search, Filter, Star, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  
  const [onionRouting, setOnionRouting] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState('AES-256');
  const [currentTorCircuit, setCurrentTorCircuit] = useState<OnionLayer[]>([]);
  const [meshConnections, setMeshConnections] = useState(0);
  const [activeTab, setActiveTab] = useState('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    setOnionRouting(true);
    setMeshConnections(7);
    toast({
      title: "🧅 Onion Routing Activated",
      description: "Your traffic is now routing through multiple encrypted layers",
    });
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-900/10 to-purple-900/10 border-red-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl flex items-center justify-center gap-3">
              <Skull className="h-10 w-10 text-red-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500">
                Underground Hub
              </span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Maximum anonymity tools for the digital underground
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 animate-pulse">
                ⚠️ High Risk
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                🔒 Military Grade
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                🌐 Global Network
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Connection Status */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-500" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {onionRouting ? '🧅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">Onion Routing</div>
                <div className="text-xs text-green-500">
                  {onionRouting ? 'Active' : 'Disabled'}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{meshConnections}</div>
                <div className="text-sm text-muted-foreground">Mesh Nodes</div>
                <div className="text-xs text-blue-500">Connected</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                <div className="text-2xl font-bold text-purple-500">
                  {encryptionLevel}
                </div>
                <div className="text-sm text-muted-foreground">Encryption</div>
                <div className="text-xs text-purple-500">Active</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {currentTorCircuit.length}
                </div>
                <div className="text-sm text-muted-foreground">Tor Hops</div>
                <div className="text-xs text-red-500">Layers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hub">🏠 Hub</TabsTrigger>
            <TabsTrigger value="onion">🧅 Routing</TabsTrigger>
            <TabsTrigger value="marketplace">🏪 Market</TabsTrigger>
            <TabsTrigger value="deaddrops">📍 Drops</TabsTrigger>
            <TabsTrigger value="mesh">🕸️ Mesh</TabsTrigger>
            <TabsTrigger value="terminal">💻 Terminal</TabsTrigger>
          </TabsList>

          {/* Hub Tab */}
          <TabsContent value="hub" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-900/20 to-black/50 border-red-500/30 hover:border-red-400/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Globe className="h-5 w-5" />
                    Onion Routing
                  </CardTitle>
                  <CardDescription>
                    Multi-layer anonymous routing through global network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={initializeOnionRouting}
                    disabled={onionRouting}
                  >
                    {onionRouting ? 'Already Active' : 'Initialize Network'}
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
