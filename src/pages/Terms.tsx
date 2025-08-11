import { Shield, Eye, Lock, AlertTriangle, CheckCircle, Globe, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const Terms = () => {
  const privacyCommitments = [
    {
      icon: Eye,
      title: "Zero Data Collection",
      description: "We collect absolutely no personal information, browsing data, or usage analytics.",
      commitment: "NEVER COLLECTED"
    },
    {
      icon: Server,
      title: "No Server Logs",
      description: "No access logs, error logs, or any server-side logging of user activities.",
      commitment: "ZERO LOGGING"
    },
    {
      icon: Lock,
      title: "Ephemeral Storage",
      description: "All data exists only in memory during active sessions and is destroyed immediately after.",
      commitment: "MEMORY ONLY"
    },
    {
      icon: Globe,
      title: "Anonymous Access",
      description: "No registration, accounts, or identifying information required to use our service.",
      commitment: "TRULY ANONYMOUS"
    }
  ];

  const technicalSpecs = [
    {
      category: "Encryption",
      items: [
        "AES-256-GCM for message encryption",
        "RSA-4096 for key exchange",
        "Signal Protocol implementation",
        "Perfect Forward Secrecy",
        "Client-side key generation"
      ]
    },
    {
      category: "Network Security",
      items: [
        "Tor network integration",
        "IP masking via proxy servers",
        "WebRTC TURN relay protection",
        "DNS-over-HTTPS",
        "Certificate pinning"
      ]
    },
    {
      category: "Data Protection",
      items: [
        "In-memory only processing",
        "Automatic data destruction",
        "No persistent storage",
        "Secure memory wiping",
        "Anti-forensics measures"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              ⚖️ Terms & Privacy Policy
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Our </span>
              <span className="gradient-neon bg-clip-text text-transparent">Privacy Promise</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Understand our unwavering commitment to your privacy, anonymity, and digital rights. 
              These are not just policies - they are technical guarantees.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-neon-green" />
                <span className="text-neon-green">Zero Data Collection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-primary">Technical Guarantees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-accent">Open Source Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Commitments */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-foreground">Privacy </span>
              <span className="gradient-neon bg-clip-text text-transparent">Commitments</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Technical guarantees that ensure your complete anonymity and privacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {privacyCommitments.map((commitment, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-green-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <commitment.icon className="h-6 w-6 text-green-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      {commitment.commitment}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{commitment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-foreground/80">
                    {commitment.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Legal Framework</h2>
              <p className="text-lg text-muted-foreground">
                Understanding our legal position and your rights
              </p>
            </div>

            <div className="space-y-8">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">1. Service Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <p>
                    SecureChat is an anonymous, encrypted communication platform designed to protect user privacy 
                    through advanced cryptographic techniques and anonymous networking protocols.
                  </p>
                  <p>
                    We provide this service as a tool for legitimate privacy protection and do not monitor, 
                    store, or have access to user communications due to our technical architecture.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">2. Data Collection (What We DON'T Collect)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-400">We Never Collect:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Personal identifying information</li>
                        <li>• IP addresses or location data</li>
                        <li>• Message content or metadata</li>
                        <li>• Usage analytics or logs</li>
                        <li>• Browser fingerprints</li>
                        <li>• Device information</li>
                        <li>• Timestamps or session data</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-400">Technical Guarantees:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• In-memory only processing</li>
                        <li>• No database storage</li>
                        <li>• Automatic data destruction</li>
                        <li>• Client-side encryption</li>
                        <li>• Anonymous networking</li>
                        <li>• Open-source verification</li>
                        <li>• Cryptographic proof of privacy</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">3. User Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <p>
                    By using SecureChat, you acknowledge that you are responsible for:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Complying with all applicable local laws and regulations</li>
                    <li>• Using the service for lawful purposes only</li>
                    <li>• Protecting your own operational security practices</li>
                    <li>• Understanding the technical limitations of anonymity tools</li>
                    <li>• Not using the service to harm others or engage in illegal activities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">4. Service Limitations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <p>
                    While we provide strong technical privacy protections, users should understand:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• No system is 100% secure against all possible attacks</li>
                    <li>• Users must maintain good operational security practices</li>
                    <li>• Legal jurisdictions may vary in their treatment of privacy tools</li>
                    <li>• Service availability may be affected by network conditions or legal requirements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">5. Legal Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <p>
                    Due to our technical architecture, we cannot:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Provide user data (we have none to provide)</li>
                    <li>• Monitor communications (technically impossible)</li>
                    <li>• Implement backdoors (would compromise all users)</li>
                    <li>• Identify specific users (system designed to prevent this)</li>
                  </ul>
                  <p className="mt-4">
                    This is not a choice but a technical limitation of our privacy-first architecture.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Technical Privacy Specifications</h2>
              <p className="text-lg text-muted-foreground">
                Detailed technical implementation of our privacy protections
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {technicalSpecs.map((spec, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{spec.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {spec.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-16 bg-red-900/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-red-900/20 border-red-500/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-4">Important Legal Notice</h3>
                    <div className="space-y-3 text-foreground/80">
                      <p>
                        SecureChat is designed to protect privacy and anonymity for legitimate purposes. 
                        The service should not be used for illegal activities.
                      </p>
                      <p>
                        Users are solely responsible for ensuring their use complies with applicable laws 
                        in their jurisdiction. Privacy tools are legal in most countries but regulations vary.
                      </p>
                      <p>
                        We reserve the right to discontinue service or implement additional security measures 
                        if required by law, though our technical architecture limits our ability to selectively 
                        compromise user privacy.
                      </p>
                    </div>
                  </div>
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
            <h2 className="text-3xl font-bold">Questions About Our Privacy Policy?</h2>
            <p className="text-lg text-muted-foreground">
              Contact us anonymously if you need clarification about our privacy practices or technical implementation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="lg" asChild>
                <Link to="/contact">
                  <Shield className="mr-2 h-5 w-5" />
                  Anonymous Contact
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/how-it-works">
                  <Eye className="mr-2 h-5 w-5" />
                  Technical Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
