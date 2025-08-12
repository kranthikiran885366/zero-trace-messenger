import { Shield, Timer, Video, Lock, Zap, Globe, Eye, Server, Smartphone, Headphones, FileText, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();
  const coreFeatures = [
    {
      icon: Shield,
      title: "IP Masking & Anonymous Routing",
      description: "Your real IP address is never exposed through Tor network integration and VPN proxy tunnels with rotating exit nodes.",
      benefits: ["Tor network integration", "Multiple proxy layers", "Real IP never logged", "Exit node rotation"]
    },
    {
      icon: Timer,
      title: "Self-Destructing Messages",
      description: "Messages automatically delete after customizable time periods - from 15 seconds to hours, or instantly on read.",
      benefits: ["15s to 1h timers", "Read-once deletion", "Custom time settings", "No message history"]
    },
    {
      icon: Video,
      title: "Encrypted Video & Audio Calls",
      description: "P2P encrypted video/audio calls with WebRTC and DTLS-SRTP encryption, routed through secure TURN relays.",
      benefits: ["WebRTC P2P calls", "DTLS-SRTP encryption", "IP masked via TURN", "Zero call logs"]
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Military-grade AES-256 encryption with Signal Protocol implementation ensures only intended recipients can read messages.",
      benefits: ["AES-256 encryption", "Signal Protocol", "Client-side keys", "Perfect forward secrecy"]
    },
    {
      icon: Zap,
      title: "Anonymous Login",
      description: "No email, phone number, or personal information required. Generate disposable IDs or join with secure room codes.",
      benefits: ["No registration", "Disposable identities", "Instant access", "Zero personal data"]
    },
    {
      icon: Globe,
      title: "Stealth Mode Operations",
      description: "App can disguise itself as a calculator, note-taking tool, or other innocent applications to avoid detection.",
      benefits: ["Calculator disguise", "Fake UI modes", "Decoy interfaces", "Detection avoidance"]
    }
  ];

  const advancedFeatures = [
    {
      icon: Eye,
      title: "Zero Metadata Logging",
      description: "No timestamps, sender details, message IDs, or any metadata is stored anywhere.",
      badge: "Advanced"
    },
    {
      icon: Server,
      title: "Ephemeral Data Storage",
      description: "All data exists only in memory during active sessions. Complete destruction after chat ends.",
      badge: "Advanced"
    },
    {
      icon: Smartphone,
      title: "Fingerprint Obfuscation",
      description: "Prevents browser and device fingerprinting to maintain complete anonymity.",
      badge: "Advanced"
    },
    {
      icon: Headphones,
      title: "Encrypted Voice Notes",
      description: "Record, encrypt, and send voice messages with optional AI translation support.",
      badge: "Advanced"
    },
    {
      icon: FileText,
      title: "Steganography Messaging",
      description: "Hide encrypted messages inside innocent-looking images or documents.",
      badge: "Advanced"
    },
    {
      icon: AlertTriangle,
      title: "AI Threat Detection",
      description: "Automatically detects and warns about phishing links, malware, and suspicious content.",
      badge: "Advanced"
    }
  ];

  const uniqueFeatures = [
    {
      title: "Burn-on-View Media",
      description: "Images and videos are automatically deleted after a single view",
      icon: "🔥"
    },
    {
      title: "Geo-Fuzzing",
      description: "Optional location sharing with ±500m accuracy fuzzing for privacy",
      icon: "📍"
    },
    {
      title: "One-Time Chat Rooms",
      description: "Disposable rooms that automatically expire after use",
      icon: "⏰"
    },
    {
      title: "Decoy Chat Interface",
      description: "Show fake conversations if forced to open the app",
      icon: "🎭"
    },
    {
      title: "QR Code Pairing",
      description: "Connect devices instantly using encrypted QR codes",
      icon: "📱"
    },
    {
      title: "PWA Mode",
      description: "Browser-based app with zero installation trace",
      icon: "🌐"
    }
  ];

  const comparisonFeatures = [
    { feature: "End-to-End Encryption", secureChat: true, telegram: true, whatsapp: true, discord: false },
    { feature: "IP Masking", secureChat: true, telegram: false, whatsapp: false, discord: false },
    { feature: "No Metadata Logging", secureChat: true, telegram: false, whatsapp: false, discord: false },
    { feature: "Anonymous Registration", secureChat: true, telegram: false, whatsapp: false, discord: false },
    { feature: "Self-Destructing Messages", secureChat: true, telegram: true, whatsapp: false, discord: false },
    { feature: "Stealth Mode", secureChat: true, telegram: false, whatsapp: false, discord: false },
    { feature: "Zero Server Logs", secureChat: true, telegram: false, whatsapp: false, discord: false },
    { feature: "Tor Network Support", secureChat: true, telegram: false, whatsapp: false, discord: false }
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
            onClick={() => navigate('/create')}
            className="bg-accent/10 border-accent/50 hover:bg-accent/20 hover:border-accent/70 text-accent transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <Lock className="h-5 w-5 mr-2" />
            CREATE SECURE ROOM
          </Button>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/8090263/pexels-photo-8090263.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cybersecurity technology background"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-darker/80 via-background/70 to-cyber-dark/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🚀 Complete Feature Overview
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Every </span>
              <span className="gradient-neon bg-clip-text text-transparent">Privacy Feature</span>
              <span className="text-foreground"> You Need</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              From basic encryption to advanced anti-surveillance techniques - explore all the features 
              that make SecureChat the most private communication platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" asChild>
                <Link to="/create">
                  <Shield className="mr-2 h-5 w-5" />
                  Try All Features
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Core </span>
              <span className="gradient-neon bg-clip-text text-transparent">Security Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Essential privacy and security features that form the foundation of SecureChat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group bg-card/50 backdrop-blur-sm animated-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Advanced </span>
              <span className="gradient-neon bg-clip-text text-transparent">Privacy Tools</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade security features for maximum anonymity and protection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="group bg-card/50 backdrop-blur-sm border-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Unique </span>
              <span className="gradient-neon bg-clip-text text-transparent">Innovation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge features you won't find in any other messaging platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueFeatures.map((feature, index) => (
              <Card key={index} className="group bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-foreground">Why Choose </span>
                <span className="gradient-neon bg-clip-text text-transparent">SecureChat?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                See how we compare to other messaging platforms
              </p>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4 font-semibold text-primary">SecureChat</th>
                        <th className="text-center p-4 font-semibold">Telegram</th>
                        <th className="text-center p-4 font-semibold">WhatsApp</th>
                        <th className="text-center p-4 font-semibold">Discord</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((row, index) => (
                        <tr key={index} className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="text-center p-4">
                            {row.secureChat ? (
                              <div className="w-6 h-6 bg-neon-green rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-destructive rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            )}
                          </td>
                          <td className="text-center p-4">
                            {row.telegram ? (
                              <div className="w-6 h-6 bg-neon-green rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-destructive rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            )}
                          </td>
                          <td className="text-center p-4">
                            {row.whatsapp ? (
                              <div className="w-6 h-6 bg-neon-green rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-destructive rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            )}
                          </td>
                          <td className="text-center p-4">
                            {row.discord ? (
                              <div className="w-6 h-6 bg-neon-green rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-destructive rounded-full mx-auto flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Experience All Features Now</h2>
            <p className="text-lg text-muted-foreground">
              Test every privacy feature in a real secure chat environment. No registration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" asChild>
                <Link to="/create">
                  <Shield className="mr-2 h-5 w-5" />
                  Start Secure Chat
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/join">Join Demo Room</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
