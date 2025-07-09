import { useState } from 'react';
import { Search, Shield, Lock, Timer, Video, Globe, Server, AlertTriangle, MessageSquare, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Security & Privacy",
      icon: Shield,
      color: "text-primary",
      questions: [
        {
          q: "How is my IP address masked?",
          a: "SecureChat routes all traffic through the Tor network or VPN proxy servers with rotating exit nodes. Your real IP address is never exposed to other users or logged by our servers."
        },
        {
          q: "Can anyone trace my messages back to me?",
          a: "No. We use end-to-end encryption, anonymous routing, and store zero metadata. Even if someone intercepted the traffic, they couldn't trace it back to you or decrypt the messages."
        },
        {
          q: "What encryption do you use?",
          a: "We use AES-256 encryption with the Signal Protocol for perfect forward secrecy. Each message has unique encryption keys that are automatically destroyed after use."
        },
        {
          q: "Do you store any logs or user data?",
          a: "Absolutely not. We store zero logs, no user data, no metadata, and no conversation history. All data exists only in memory during active sessions."
        }
      ]
    },
    {
      title: "Features & Usage",
      icon: MessageSquare,
      color: "text-accent",
      questions: [
        {
          q: "How do self-destructing messages work?",
          a: "You can set messages to auto-delete after 15 seconds to 1 hour, or immediately when read. The timer starts when the message is sent, and deletion happens on all devices simultaneously."
        },
        {
          q: "Can I make video calls securely?",
          a: "Yes! Our video calls use P2P WebRTC with DTLS-SRTP encryption. Your IP is masked through TURN relay servers, and no call data is logged anywhere."
        },
        {
          q: "What is Stealth Mode?",
          a: "Stealth Mode disguises SecureChat as an innocent app like a calculator or note-taking tool. This helps avoid detection in surveillance environments."
        },
        {
          q: "How long do chat rooms last?",
          a: "Room creators can set auto-destruction timers from 30 minutes to 24 hours, or manual destruction. Once destroyed, all data is permanently deleted."
        }
      ]
    },
    {
      title: "Technical Details",
      icon: Server,
      color: "text-neon-green",
      questions: [
        {
          q: "How does anonymous login work?",
          a: "No registration required. You generate a cryptographically secure disposable ID that's only used for that session. No email, phone, or personal information needed."
        },
        {
          q: "What happens to messages when I close the app?",
          a: "All messages are stored only in memory during active sessions. When you close the app or the session ends, everything is permanently deleted."
        },
        {
          q: "Can you recover deleted messages?",
          a: "No, it's technically impossible. We don't store messages anywhere - they only exist in temporary memory and are cryptographically destroyed when deleted."
        },
        {
          q: "How do you prevent browser fingerprinting?",
          a: "We use advanced fingerprint obfuscation techniques to prevent tracking through browser characteristics, screen resolution, installed fonts, etc."
        }
      ]
    },
    {
      title: "Safety & Threats",
      icon: AlertTriangle,
      color: "text-destructive",
      questions: [
        {
          q: "Does SecureChat detect malicious links?",
          a: "Yes, our AI-powered threat detection automatically scans messages for phishing links, malware, and suspicious content, warning you before you click."
        },
        {
          q: "What if someone forces me to open the app?",
          a: "Stealth Mode can show decoy conversations or disguise the app entirely. You can also set up panic words that trigger fake content display."
        },
        {
          q: "Can governments or law enforcement access my chats?",
          a: "No. We have zero data to provide even if legally compelled. The combination of encryption, anonymity, and zero logging makes surveillance impossible."
        },
        {
          q: "Is SecureChat legal to use?",
          a: "Yes, privacy is a fundamental right. However, users are responsible for complying with local laws. We don't condone illegal activities."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const popularQuestions = [
    "How is my IP address masked?",
    "Can anyone trace my messages?",
    "How do self-destructing messages work?",
    "Is SecureChat really anonymous?",
    "What encryption do you use?"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              ❓ Frequently Asked Questions
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Get </span>
              <span className="gradient-neon bg-clip-text text-transparent">Answers</span>
              <span className="text-foreground"> Fast</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Everything you need to know about SecureChat's privacy features, 
              security architecture, and how to stay completely anonymous.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/50 border-border focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      {!searchTerm && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Popular Questions</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {popularQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm(question)}
                    className="border border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {category.questions.map((qa, index) => (
                    <Card key={index} className="group bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg leading-relaxed">{qa.q}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed text-foreground/80">
                          {qa.a}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Results */}
      {searchTerm && filteredCategories.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try different keywords or browse our categories above.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Still Have Questions */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Can't find what you're looking for? Our anonymous contact form 
                  ensures your privacy while getting help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="cyber" size="lg" asChild>
                    <Link to="/contact">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Anonymous Contact
                    </Link>
                  </Button>
                  <Button variant="neon" size="lg" asChild>
                    <Link to="/how-it-works">
                      <Eye className="mr-2 h-5 w-5" />
                      How It Works
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground">
              No more questions? Jump into a secure chat session right now.
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

export default FAQ;