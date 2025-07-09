import { useState } from 'react';
import { Eye, EyeOff, Calculator, FileText, Shield, Settings, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const AppModes = () => {
  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [stealthMode, setStealthMode] = useState('calculator');
  const [decoyEnabled, setDecoyEnabled] = useState(false);
  const [panicCode, setPanicCode] = useState('');

  const stealthModes = [
    {
      id: 'calculator',
      title: 'Calculator App',
      description: 'Disguise as a simple calculator application',
      icon: Calculator,
      preview: 'Shows working calculator with math functions'
    },
    {
      id: 'notepad',
      title: 'Note Taking App',
      description: 'Appears as a basic note-taking application',
      icon: FileText,
      preview: 'Displays editable text notes interface'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Looks like device settings panel',
      icon: Settings,
      preview: 'Shows fake system configuration options'
    }
  ];

  const securityFeatures = [
    {
      title: "Instant Mode Switch",
      description: "Switch between stealth and normal mode in under 0.5 seconds",
      icon: "⚡"
    },
    {
      title: "Panic Code Protection",
      description: "Enter a panic code to instantly activate decoy mode",
      icon: "🔐"
    },
    {
      title: "Fake Data Generation",
      description: "Generate realistic fake conversations and data",
      icon: "🎭"
    },
    {
      title: "Browser History Masking",
      description: "Disguise browser history and recent activity",
      icon: "🕵️"
    }
  ];

  if (stealthEnabled && stealthMode === 'calculator') {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="bg-gray-900 text-white p-4 rounded text-right text-2xl font-mono">
              0
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn, index) => (
              <button 
                key={index}
                className={`p-4 rounded-lg font-semibold text-lg transition-colors ${
                  ['C', '±', '%'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400' :
                  ['÷', '×', '-', '+', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                  'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (btn === 'C' && panicCode === '888') {
                    setStealthEnabled(false);
                  }
                }}
              >
                {btn === '0' ? <span className="w-full block">0</span> : btn}
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Calculator v2.1 • Type panic code to exit
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🎭 Stealth & Security Modes
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Advanced </span>
              <span className="gradient-neon bg-clip-text text-transparent">Stealth</span>
              <span className="text-foreground"> Modes</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Configure advanced security modes to protect your identity and avoid detection 
              in surveillance environments.
            </p>
          </div>
        </div>
      </section>

      {/* Stealth Mode Toggle */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {stealthEnabled ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      Stealth Mode Control
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Enable stealth mode to disguise SecureChat as an innocent application
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {stealthEnabled ? "Active" : "Disabled"}
                    </span>
                    <Switch 
                      checked={stealthEnabled}
                      onCheckedChange={setStealthEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </CardHeader>
              {stealthEnabled && (
                <CardContent>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-medium mb-2">⚠️ Stealth Mode Active</p>
                    <p className="text-sm text-muted-foreground">
                      The app will now appear as a {stealthModes.find(m => m.id === stealthMode)?.title}. 
                      Use your panic code to return to normal mode.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Stealth Mode Options */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-foreground">Choose Your </span>
                <span className="gradient-neon bg-clip-text text-transparent">Disguise</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Select how SecureChat should appear when stealth mode is active
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {stealthModes.map((mode) => (
                <Card 
                  key={mode.id} 
                  className={`group cursor-pointer transition-all duration-300 ${
                    stealthMode === mode.id 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                      : 'bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10'
                  }`}
                  onClick={() => setStealthMode(mode.id)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <mode.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl flex items-center justify-between">
                      {mode.title}
                      {stealthMode === mode.id && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Selected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/20 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        Preview: {mode.preview}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Security Settings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="text-foreground">Advanced </span>
              <span className="gradient-neon bg-clip-text text-transparent">Security</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Decoy Mode */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Decoy Chat Mode
                    <Switch 
                      checked={decoyEnabled}
                      onCheckedChange={setDecoyEnabled}
                      className="data-[state=checked]:bg-accent"
                    />
                  </CardTitle>
                  <CardDescription>
                    Show fake conversations if forced to open the app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      When enabled, opening the app under duress will show pre-generated 
                      innocent conversations instead of real chats.
                    </p>
                    {decoyEnabled && (
                      <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                        <p className="text-sm text-accent font-medium">
                          Decoy conversations ready
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Panic Code */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Panic Code Setup</CardTitle>
                  <CardDescription>
                    Set a code to instantly activate stealth or decoy mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Enter panic code..."
                      value={panicCode}
                      onChange={(e) => setPanicCode(e.target.value)}
                      className="bg-background/50"
                    />
                    <p className="text-sm text-muted-foreground">
                      Type this code in any stealth mode to return to normal SecureChat.
                      Keep it memorable but not obvious.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Security Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Test Stealth Mode */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Test Your Stealth Setup</h2>
            <p className="text-lg text-muted-foreground">
              Verify your stealth mode configuration before relying on it for security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="cyber" 
                size="lg"
                onClick={() => setStealthEnabled(true)}
                disabled={!panicCode}
              >
                <EyeOff className="mr-2 h-5 w-5" />
                Activate Stealth Mode
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/create">
                  <Shield className="mr-2 h-5 w-5" />
                  Start Secure Chat
                </Link>
              </Button>
            </div>
            {!panicCode && (
              <p className="text-sm text-destructive">
                Set a panic code before testing stealth mode
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppModes;