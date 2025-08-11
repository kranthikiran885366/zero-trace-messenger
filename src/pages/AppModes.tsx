import { useState } from 'react';
import { Palette, Eye, EyeOff, Calculator, FileText, Calendar, Camera, Music, Gamepad2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const AppModes = () => {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState('secure');
  const [selectedTheme, setSelectedTheme] = useState('cyber');
  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const appModes = [
    {
      id: 'secure',
      name: 'Secure Mode',
      description: 'Full security features with visible SecureChat branding',
      icon: Eye,
      color: 'bg-primary/10 text-primary border-primary/20',
      features: ['All security features', 'Visible branding', 'Full functionality', 'Advanced tools']
    },
    {
      id: 'stealth',
      name: 'Stealth Mode',
      description: 'Disguised as innocent applications to avoid detection',
      icon: EyeOff,
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      features: ['Hidden interface', 'Decoy applications', 'Secret access codes', 'Plausible deniability']
    },
    {
      id: 'minimal',
      name: 'Minimal Mode',
      description: 'Simplified interface with essential features only',
      icon: Monitor,
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
      features: ['Clean interface', 'Core features only', 'Faster loading', 'Less conspicuous']
    }
  ];

  const stealthApps = [
    {
      id: 'calculator',
      name: 'Calculator',
      icon: Calculator,
      description: 'Scientific calculator with secret access',
      preview: '🔢 Advanced Calculator Pro',
      access: 'Enter 888+888= to unlock'
    },
    {
      id: 'notepad',
      name: 'Notepad',
      icon: FileText,
      description: 'Simple text editor disguise',
      preview: '📝 Quick Notes App',
      access: 'Type "SecureChat" to unlock'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      description: 'Calendar app with hidden features',
      preview: '📅 Personal Calendar',
      access: 'Create event "Meeting" to unlock'
    },
    {
      id: 'camera',
      name: 'Camera',
      icon: Camera,
      description: 'Photo app with secret mode',
      preview: '📸 Camera Plus',
      access: 'Take 3 photos quickly to unlock'
    },
    {
      id: 'music',
      name: 'Music Player',
      icon: Music,
      description: 'Music player with hidden chat',
      preview: '🎵 Music Player Pro',
      access: 'Play track titled "Secure" to unlock'
    },
    {
      id: 'games',
      name: 'Games',
      icon: Gamepad2,
      description: 'Simple games with secret access',
      preview: '🎮 Mini Games',
      access: 'Achieve score 1337 to unlock'
    }
  ];

  const themes = [
    {
      id: 'cyber',
      name: 'Cyber Dark',
      description: 'Futuristic dark theme with neon accents',
      preview: 'bg-gradient-to-br from-blue-900 to-purple-900'
    },
    {
      id: 'matrix',
      name: 'Matrix Green',
      description: 'Classic green-on-black hacker aesthetic',
      preview: 'bg-gradient-to-br from-green-900 to-black'
    },
    {
      id: 'noir',
      name: 'Dark Noir',
      description: 'Minimalist black and white design',
      preview: 'bg-gradient-to-br from-gray-900 to-black'
    },
    {
      id: 'ghost',
      name: 'Ghost White',
      description: 'Clean white theme for daylight use',
      preview: 'bg-gradient-to-br from-gray-100 to-white'
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      description: 'Warm orange and red color scheme',
      preview: 'bg-gradient-to-br from-orange-500 to-red-600'
    },
    {
      id: 'ocean',
      name: 'Deep Ocean',
      description: 'Blue underwater theme',
      preview: 'bg-gradient-to-br from-blue-800 to-blue-900'
    }
  ];

  const applyMode = () => {
    toast({
      title: `${appModes.find(m => m.id === selectedMode)?.name} Applied`,
      description: `SecureChat is now running in ${selectedMode} mode with ${selectedTheme} theme`,
    });
  };

  const activateStealth = (appType: string) => {
    toast({
      title: "🕵️ Stealth Mode Activated",
      description: `App disguised as ${stealthApps.find(app => app.id === appType)?.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🎨 Application Modes & Themes
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Customize Your </span>
              <span className="gradient-neon bg-clip-text text-transparent">Experience</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Choose between security-focused, stealth, or minimal modes. 
              Customize themes and disguises to match your privacy needs.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary">Multiple Themes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent">Stealth Disguises</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span className="text-neon-green">Responsive Design</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Application </span>
              <span className="gradient-neon bg-clip-text text-transparent">Modes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the mode that best fits your security and privacy requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {appModes.map((mode) => (
              <Card 
                key={mode.id} 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedMode === mode.id 
                    ? `${mode.color} scale-105 shadow-lg` 
                    : 'bg-card/50 hover:bg-card/70'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-background/20 flex items-center justify-center">
                      <mode.icon className="h-6 w-6" />
                    </div>
                    {selectedMode === mode.id && (
                      <Badge variant="secondary" className="bg-background/20">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{mode.name}</CardTitle>
                  <CardDescription className="text-base">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Selection */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visual Themes</h2>
            <p className="text-lg text-muted-foreground">
              Customize the visual appearance to match your preference
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {themes.map((theme) => (
              <Card 
                key={theme.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedTheme === theme.id ? 'ring-2 ring-primary scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <CardContent className="p-4">
                  <div className={`w-full h-20 rounded-lg mb-3 ${theme.preview}`} />
                  <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stealth Applications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-foreground">Stealth </span>
              <span className="gradient-neon bg-clip-text text-transparent">Disguises</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Hide SecureChat behind innocent-looking applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stealthApps.map((app) => (
              <Card key={app.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <app.icon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">Stealth</Badge>
                    </div>
                  </div>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Preview:</p>
                    <p className="text-sm text-muted-foreground">{app.preview}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs font-medium text-yellow-600 mb-1">Secret Access:</p>
                    <p className="text-xs text-muted-foreground">{app.access}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => activateStealth(app.id)}
                  >
                    Activate Disguise
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Preview */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Device Preview</h2>
              <p className="text-lg text-muted-foreground">
                See how your selected mode and theme will look across different devices
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <Button 
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="mr-2 h-4 w-4" />
                Desktop
              </Button>
              <Button 
                variant={previewMode === 'tablet' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="mr-2 h-4 w-4" />
                Tablet
              </Button>
              <Button 
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Mobile
              </Button>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className={`
                  mx-auto rounded-lg border-2 border-border bg-gradient-to-br transition-all duration-300
                  ${previewMode === 'desktop' ? 'w-full h-96' : ''}
                  ${previewMode === 'tablet' ? 'w-3/4 h-80' : ''}
                  ${previewMode === 'mobile' ? 'w-64 h-96' : ''}
                  ${themes.find(t => t.id === selectedTheme)?.preview}
                `}>
                  <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-4">
                      {appModes.find(m => m.id === selectedMode)?.icon && (
                        <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                          {React.createElement(appModes.find(m => m.id === selectedMode)!.icon, { 
                            className: "h-8 w-8 text-white" 
                          })}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {appModes.find(m => m.id === selectedMode)?.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {themes.find(t => t.id === selectedTheme)?.name} Theme
                    </p>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} View
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Settings & Apply */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Apply Settings</CardTitle>
                <CardDescription className="text-center">
                  Confirm your mode and theme selection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Selected Mode:</p>
                    <p className="font-semibold">{appModes.find(m => m.id === selectedMode)?.name}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Selected Theme:</p>
                    <p className="font-semibold">{themes.find(t => t.id === selectedTheme)?.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <div>
                    <p className="font-medium">Enable Stealth Mode</p>
                    <p className="text-sm text-muted-foreground">Activate when privacy is critical</p>
                  </div>
                  <Switch 
                    checked={stealthEnabled}
                    onCheckedChange={setStealthEnabled}
                  />
                </div>

                <Button 
                  variant="cyber" 
                  className="w-full" 
                  size="lg"
                  onClick={applyMode}
                >
                  <Palette className="mr-2 h-5 w-5" />
                  Apply Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppModes;
