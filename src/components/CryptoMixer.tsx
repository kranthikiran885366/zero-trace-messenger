import { useState } from 'react';
import { Bitcoin, Shuffle, ArrowRight, Eye, EyeOff, Clock, Shield, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface MixingPool {
  currency: string;
  symbol: string;
  poolSize: string;
  participants: number;
  avgDelay: string;
  fee: string;
}

const CryptoMixer = () => {
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAddresses, setOutputAddresses] = useState(['']);
  const [mixingInProgress, setMixingInProgress] = useState(false);
  const [mixingProgress, setMixingProgress] = useState(0);
  const [delayHours, setDelayHours] = useState('6');

  const mixingPools: MixingPool[] = [
    {
      currency: 'Bitcoin',
      symbol: 'BTC',
      poolSize: '1,247.89',
      participants: 156,
      avgDelay: '4-8 hours',
      fee: '0.5-3%'
    },
    {
      currency: 'Monero',
      symbol: 'XMR',
      poolSize: '8,934.12',
      participants: 289,
      avgDelay: '2-6 hours',
      fee: '0.25-2%'
    },
    {
      currency: 'Zcash',
      symbol: 'ZEC',
      poolSize: '3,456.78',
      participants: 94,
      avgDelay: '3-7 hours',
      fee: '0.75-2.5%'
    }
  ];

  const addOutputAddress = () => {
    if (outputAddresses.length < 10) {
      setOutputAddresses([...outputAddresses, '']);
    }
  };

  const updateOutputAddress = (index: number, value: string) => {
    const newAddresses = [...outputAddresses];
    newAddresses[index] = value;
    setOutputAddresses(newAddresses);
  };

  const removeOutputAddress = (index: number) => {
    if (outputAddresses.length > 1) {
      const newAddresses = outputAddresses.filter((_, i) => i !== index);
      setOutputAddresses(newAddresses);
    }
  };

  const startMixing = async () => {
    if (!inputAmount || !outputAddresses[0]) {
      toast({
        title: "Missing Information",
        description: "Please provide amount and at least one output address",
        variant: "destructive"
      });
      return;
    }

    setMixingInProgress(true);
    setMixingProgress(0);

    // Simulate mixing process
    const interval = setInterval(() => {
      setMixingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMixingInProgress(false);
          toast({
            title: "🔄 Mixing Complete",
            description: "Your transaction has been anonymized and will be sent with delay",
          });
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  const selectedPool = mixingPools.find(pool => pool.symbol === selectedCurrency);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-900/10 to-yellow-900/10 border-orange-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl flex items-center justify-center gap-3">
              <Shuffle className="h-10 w-10 text-orange-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                Crypto Mixer
              </span>
            </CardTitle>
            <CardDescription className="text-lg">
              Anonymous cryptocurrency tumbling service for maximum privacy
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                🔄 Multi-Pool Mixing
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                🔒 Zero Logs
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                ⚡ Instant Processing
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Warning */}
        <Card className="bg-red-900/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-400">Legal Disclaimer</p>
                <p className="text-sm text-muted-foreground">
                  This tool is for educational purposes only. Users are responsible for compliance with local laws and regulations. 
                  Cryptocurrency mixing may be illegal in some jurisdictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mixing Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5 text-orange-500" />
                  Mix Transaction
                </CardTitle>
                <CardDescription>
                  Break the transaction chain for complete anonymity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Currency</label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mixingPools.map(pool => (
                        <SelectItem key={pool.symbol} value={pool.symbol}>
                          {pool.currency} ({pool.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount to Mix</label>
                  <Input
                    type="number"
                    placeholder={`Enter ${selectedCurrency} amount`}
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: 0.001 {selectedCurrency} • Maximum: 50 {selectedCurrency}
                  </p>
                </div>

                {/* Output Addresses */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Output Addresses</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addOutputAddress}
                      disabled={outputAddresses.length >= 10}
                    >
                      Add Address
                    </Button>
                  </div>
                  {outputAddresses.map((address, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`${selectedCurrency} address ${index + 1}`}
                        value={address}
                        onChange={(e) => updateOutputAddress(index, e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                      {outputAddresses.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeOutputAddress(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Multiple output addresses increase anonymity. Max 10 addresses.
                  </p>
                </div>

                {/* Delay Settings */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Delay</label>
                  <Select value={delayHours} onValueChange={setDelayHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Longer delays provide better anonymity but require patience
                  </p>
                </div>

                {/* Mixing Progress */}
                {mixingInProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mixing Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.round(mixingProgress)}%</span>
                    </div>
                    <Progress value={mixingProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      Shuffling through anonymity pools...
                    </div>
                  </div>
                )}

                {/* Mix Button */}
                <Button 
                  variant="destructive" 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  size="lg"
                  onClick={startMixing}
                  disabled={mixingInProgress || !inputAmount || !outputAddresses[0]}
                >
                  {mixingInProgress ? (
                    <>
                      <Shuffle className="mr-2 h-4 w-4 animate-spin" />
                      Mixing in Progress...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2 h-4 w-4" />
                      Start Anonymous Mix
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pool Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Current Pool
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPool && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {selectedPool.poolSize} {selectedPool.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">Pool Size</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Participants</span>
                        <span className="font-medium">{selectedPool.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Delay</span>
                        <span className="font-medium">{selectedPool.avgDelay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mixing Fee</span>
                        <span className="font-medium">{selectedPool.fee}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-orange-500">1</span>
                  </div>
                  <p>Your coins are sent to a large anonymity pool</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-orange-500">2</span>
                  </div>
                  <p>Mixed with hundreds of other transactions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-orange-500">3</span>
                  </div>
                  <p>Clean coins sent to your addresses with delay</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>No logs policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Tor network compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>CoinJoin technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Random delays</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoMixer;
