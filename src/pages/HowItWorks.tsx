import { ArrowRight, Shield, Lock, Zap, Eye, Server, Router, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [
    {
      icon: Shield,
      title: "Anonymous Entry",
      description: "No registration, email, or phone required. Generate a disposable ID or join with a room code.",
      details: ["Disposable identity generation", "No personal data collection", "Instant access"]
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Messages encrypted with AES-256 before leaving your device. Only the recipient can decrypt.",
      details: ["AES-256 encryption", "Client-side key generation", "Signal protocol implementation"]
    },
    {
      icon: Router,
      title: "IP Masking & Routing",
      description: "Your real IP is hidden through Tor network or VPN proxy servers with rotating exit nodes.",
      details: ["Tor network integration", "Multiple proxy layers", "Real IP never exposed"]
    },
    {
      icon: Zap,
      title: "Self-Destructing Messages",
      description: "Messages automatically delete after your chosen time period or when read by recipients.",
      details: ["Timer-based deletion", "Read-once messages", "No message history stored"]
    },
    {
      icon: Eye,
      title: "Zero Metadata",
      description: "No timestamps, sender details, or message IDs are stored. Complete conversation privacy.",
      details: ["No server logs", "No metadata tracking", "Ephemeral storage only"]
    },
    {
      icon: Server,
      title: "No Trace Storage",
      description: "All data exists only in memory during active sessions. Nothing persists after chat ends.",
      details: ["In-memory processing", "No database storage", "Complete data destruction"]
    }
  ];

  const securityFlow = [
    { step: 1, action: "User enters app anonymously", security: "No tracking cookies or fingerprinting" },
    { step: 2, action: "Generate or join secure room", security: "Cryptographically secure room codes" },
    { step: 3, action: "Message typed and encrypted", security: "AES-256 client-side encryption" },
    { step: 4, action: "Route through privacy network", security: "Tor/VPN masking with exit node rotation" },
    { step: 5, action: "Deliver to recipient", security: "Direct P2P or secure relay" },
    { step: 6, action: "Auto-delete after timer", security: "Complete message destruction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Back Button Header */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="bg-primary/10 border-primary/50 hover:bg-primary/20 hover:border-primary/70 text-primary transition-all duration-300 shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            BACK TO HOME
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/features')}
            className="bg-accent/10 border-accent/50 hover:bg-accent/20 hover:border-accent/70 text-accent transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <Shield className="h-5 w-5 mr-2" />
            VIEW FEATURES
          </Button>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🔒 Military-Grade Security Architecture
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">How </span>
              <span className="gradient-neon bg-clip-text text-transparent">SecureChat</span>
              <span className="text-foreground"> Works</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Understanding the advanced security architecture that makes your conversations 
              completely anonymous and untraceable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" asChild>
                <Link to="/create">
                  Try It Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/features">View Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Security </span>
              <span className="gradient-neon bg-clip-text text-transparent">Architecture</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every layer is designed for maximum privacy and zero digital footprint
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="group bg-card/50 backdrop-blur-sm animated-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Flow */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-foreground">Message </span>
                <span className="gradient-neon bg-clip-text text-transparent">Security Flow</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                From typing to deletion - see how your messages stay completely private
              </p>
            </div>

            <div className="space-y-8">
              {securityFlow.map((item, index) => (
                <div key={index} className="flex items-start gap-6 p-6 rounded-xl bg-background/50 border border-border">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.action}</h3>
                    <p className="text-muted-foreground">{item.security}</p>
                  </div>
                  {index < securityFlow.length - 1 && (
                    <div className="hidden lg:block w-8 text-center">
                      <ArrowRight className="h-5 w-5 text-primary mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Technical Implementation</CardTitle>
                <CardDescription className="text-base">
                  The technology stack that powers complete anonymity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">Encryption & Security</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Message Encryption</span>
                          <Badge variant="secondary">AES-256</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Key Exchange</span>
                          <Badge variant="secondary">RSA-4096</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Protocol</span>
                          <Badge variant="secondary">Signal Protocol</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Video Calls</span>
                          <Badge variant="secondary">DTLS-SRTP</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-accent">Privacy Network</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">IP Masking</span>
                          <Badge variant="secondary">Tor Network</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Proxy Support</span>
                          <Badge variant="secondary">SOCKS5/HTTP</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Exit Nodes</span>
                          <Badge variant="secondary">Rotating</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">WebRTC</span>
                          <Badge variant="secondary">TURN Relay</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-neon-green">Infrastructure</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Data Storage</span>
                          <Badge variant="secondary">In-Memory Only</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Session Store</span>
                          <Badge variant="secondary">Ephemeral Redis</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Logging</span>
                          <Badge variant="secondary">Zero Logs</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Hosting</span>
                          <Badge variant="secondary">Privacy VPS</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-destructive">Anti-Surveillance</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Fingerprinting</span>
                          <Badge variant="secondary">Blocked</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tracking</span>
                          <Badge variant="secondary">None</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Analytics</span>
                          <Badge variant="secondary">Disabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Stealth Mode</span>
                          <Badge variant="secondary">Available</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Experience True Privacy?</h2>
            <p className="text-lg text-muted-foreground">
              Start an anonymous chat session now. No registration, no traces, complete security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" asChild>
                <Link to="/create">
                  <Shield className="mr-2 h-5 w-5" />
                  Create Secure Room
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/join">Join Existing Room</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
