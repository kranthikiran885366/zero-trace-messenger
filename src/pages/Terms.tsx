import { Shield, Eye, Server, Lock, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

const Terms = () => {
  const lastUpdated = "January 2024";

  const sections = [
    {
      title: "Our Core Promise",
      icon: Shield,
      content: [
        "SecureChat is built on the principle of absolute privacy. We have designed our entire system to ensure that we cannot access, store, or retrieve your conversations even if we wanted to.",
        "This Terms of Service document explains how our privacy-first architecture works and what this means for you as a user."
      ]
    },
    {
      title: "What We Don't Do",
      icon: Eye,
      content: [
        "• We don't require registration, email addresses, or phone numbers",
        "• We don't store any messages, conversation history, or metadata",
        "• We don't log IP addresses, browser fingerprints, or usage patterns",
        "• We don't use analytics, tracking pixels, or third-party services",
        "• We don't have access to your encryption keys or message content",
        "• We don't cooperate with surveillance programs or data collection"
      ]
    },
    {
      title: "Technical Architecture",
      icon: Server,
      content: [
        "All messages are encrypted client-side using AES-256 encryption before leaving your device. We never see the unencrypted content.",
        "Messages are routed through the Tor network or VPN proxies to mask your IP address from us and other users.",
        "All data exists only in temporary memory during active sessions. When you close the app, everything is permanently deleted.",
        "Our servers are configured to not write any logs, and we use ephemeral infrastructure that doesn't persist data."
      ]
    },
    {
      title: "Your Responsibilities",
      icon: AlertTriangle,
      content: [
        "You are responsible for using SecureChat in compliance with your local laws and regulations.",
        "While we provide tools for privacy and security, you should understand the limitations and use additional security measures as needed.",
        "Don't use SecureChat for illegal activities. Privacy tools should be used to protect legitimate privacy interests.",
        "Be aware that the person you're chatting with could screenshot or record messages before they self-destruct."
      ]
    },
    {
      title: "Data Policy",
      icon: Lock,
      content: [
        "We have no data to share, sell, or monetize because we don't collect any.",
        "We cannot recover lost messages, provide chat history, or help with forgotten room codes because this data doesn't exist on our systems.",
        "We cannot identify users, trace conversations, or provide user information to authorities because we don't have access to this information.",
        "Our revenue model is based on optional donations and premium features, not data collection."
      ]
    },
    {
      title: "Service Availability",
      icon: Clock,
      content: [
        "SecureChat is provided as-is without guarantees of uptime or availability.",
        "We may need to update, modify, or temporarily shut down the service for security improvements.",
        "Since we don't store your data, service interruptions won't result in data loss.",
        "We'll try to provide advance notice of planned maintenance through our public channels."
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
              📋 Terms & Privacy Policy
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Privacy-First </span>
              <span className="gradient-neon bg-clip-text text-transparent">Terms</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Simple, honest terms that put your privacy first. 
              No legal jargon, no hidden clauses, no compromises.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Last Updated: {lastUpdated}</span>
              <span>•</span>
              <span>Always Current</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-base leading-relaxed">
                    {section.content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-foreground/90">
                        {item}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Points Summary */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Key Points Summary</CardTitle>
                <CardDescription className="text-base">
                  The essential points about using SecureChat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">What This Means for You</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-neon-green rounded-full mt-2" />
                        <p className="text-sm">Complete anonymity and privacy protection</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-neon-green rounded-full mt-2" />
                        <p className="text-sm">No data collection or surveillance</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-neon-green rounded-full mt-2" />
                        <p className="text-sm">Messages automatically destroyed</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-neon-green rounded-full mt-2" />
                        <p className="text-sm">IP address completely masked</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-accent">Your Responsibilities</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                        <p className="text-sm">Use the service legally and ethically</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                        <p className="text-sm">Understand the technical limitations</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                        <p className="text-sm">Implement additional security as needed</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                        <p className="text-sm">Respect others' privacy and safety</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Bottom Line</p>
                      <p className="text-sm text-muted-foreground">
                        We've built SecureChat so that protecting your privacy is automatic, not optional. 
                        These terms explain how that works and what it means for you.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-muted/20 border-muted">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-3">Legal Disclaimer</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    SecureChat is provided as a privacy tool for legitimate use cases. Users are responsible 
                    for complying with applicable laws in their jurisdiction.
                  </p>
                  <p>
                    By using SecureChat, you acknowledge that you understand how the service works and 
                    accept these terms. Since we don't collect user data, these terms may be updated 
                    without individual notice.
                  </p>
                  <p className="font-medium mt-4">
                    For questions about these terms, use our anonymous contact form.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;