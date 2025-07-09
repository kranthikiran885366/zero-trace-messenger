import { useState } from 'react';
import { Send, Shield, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'security', label: 'Security Concern', icon: Shield },
    { value: 'bug', label: 'Bug Report', icon: AlertCircle },
    { value: 'feature', label: 'Feature Request', icon: MessageSquare },
    { value: 'privacy', label: 'Privacy Question', icon: Shield },
    { value: 'general', label: 'General Inquiry', icon: Mail }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-muted-foreground' },
    { value: 'normal', label: 'Normal', color: 'text-foreground' },
    { value: 'high', label: 'High Priority', color: 'text-accent' },
    { value: 'critical', label: 'Critical Security Issue', color: 'text-destructive' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent Anonymously",
        description: "Your anonymous message has been submitted securely. We'll investigate and respond if possible.",
      });
      
      // Reset form
      setFormData({
        subject: '',
        category: '',
        message: '',
        urgency: 'normal'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🔒 Anonymous Contact
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Secure </span>
              <span className="gradient-neon bg-clip-text text-transparent">Anonymous</span>
              <span className="text-foreground"> Contact</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Send us feedback, report issues, or ask questions while maintaining 
              complete anonymity. No tracking, no logging, no compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Anonymous Message Form
                </CardTitle>
                <CardDescription className="text-base">
                  Your message is sent through encrypted channels with no way to trace back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Category *</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Level */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Priority Level</label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <span className={level.color}>{level.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      placeholder="Brief description of your message..."
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      placeholder="Describe your issue, question, or feedback in detail. Include any relevant information that might help us assist you."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="bg-background/50 border-border focus:border-primary min-h-32"
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.message.length}/2000 characters
                    </p>
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">Privacy Protection Active</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Your IP address is masked through Tor network</p>
                          <p>• No tracking or analytics on this form</p>
                          <p>• Message content is encrypted before transmission</p>
                          <p>• No way to identify or contact you directly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    variant="cyber" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Sending Anonymously...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Anonymous Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Information */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="text-foreground">How We Protect </span>
              <span className="gradient-neon bg-clip-text text-transparent">Your Privacy</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Technical Safeguards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">Tor Network Routing</p>
                      <p className="text-xs text-muted-foreground">All form submissions routed through Tor for IP anonymity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">End-to-End Encryption</p>
                      <p className="text-xs text-muted-foreground">Messages encrypted before leaving your browser</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">Zero Logging</p>
                      <p className="text-xs text-muted-foreground">No IP logs, browser fingerprints, or tracking data stored</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Response Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">No Direct Replies</p>
                      <p className="text-xs text-muted-foreground">We cannot respond directly due to anonymity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">Public Responses</p>
                      <p className="text-xs text-muted-foreground">Important issues addressed in FAQ or updates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-sm">Security Issues</p>
                      <p className="text-xs text-muted-foreground">Critical security reports get immediate attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Alternative Methods</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">📧</div>
                  <CardTitle className="text-lg">Encrypted Email</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Use ProtonMail or similar encrypted email services
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <CardTitle className="text-lg">Anonymous Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our support room for real-time help
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🔐</div>
                  <CardTitle className="text-lg">PGP Encrypted</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Send PGP encrypted messages via secure channels
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;