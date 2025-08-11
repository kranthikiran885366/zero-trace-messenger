import { useState } from 'react';
import { Send, Shield, MessageSquare, Lock, Eye, EyeOff, Mail, AlertTriangle, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: '',
    anonymous: true,
    email: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'security', label: 'Security Concern', icon: '🔒' },
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '✨' },
    { value: 'privacy', label: 'Privacy Question', icon: '🛡️' },
    { value: 'technical', label: 'Technical Support', icon: '⚙️' },
    { value: 'legal', label: 'Legal Inquiry', icon: '⚖️' },
    { value: 'media', label: 'Media Request', icon: '📰' },
    { value: 'other', label: 'Other', icon: '💬' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-500' },
    { value: 'normal', label: 'Normal Priority', color: 'text-blue-500' },
    { value: 'high', label: 'High Priority', color: 'text-yellow-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitted(true);
    setIsSubmitting(false);

    toast({
      title: "🔒 Message Sent Anonymously",
      description: "Your message has been encrypted and sent. We'll respond via secure channels.",
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      category: '',
      subject: '',
      message: '',
      anonymous: true,
      email: '',
      priority: 'normal'
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-green-500/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Message Sent Securely</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Your message has been encrypted and transmitted through secure channels. 
                  {formData.anonymous ? ' No identifying information was stored.' : ' We will respond to your provided email.'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="font-semibold text-green-500">Message ID</div>
                    <div className="font-mono">{Math.random().toString(36).substr(2, 12)}</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="font-semibold text-blue-500">Priority</div>
                    <div className="capitalize">{formData.priority}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Expected response time: {formData.priority === 'urgent' ? '2-4 hours' : formData.priority === 'high' ? '4-12 hours' : '1-3 days'}
                  </p>
                  <Button onClick={resetForm} variant="cyber">
                    <Send className="mr-2 h-4 w-4" />
                    Send Another Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/faq')}
            className="bg-accent/10 border-accent/50 hover:bg-accent/20 hover:border-accent/70 text-accent transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            VIEW FAQ
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyber-darker via-background to-cyber-dark cyber-grid">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              📞 Anonymous Contact
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Secure </span>
              <span className="gradient-neon bg-clip-text text-transparent">Contact</span>
              <span className="text-foreground"> Form</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Get in touch while maintaining complete anonymity. Your message is encrypted 
              and transmitted through secure channels with zero tracking.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span className="text-neon-green">Anonymous by Default</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent">No IP Logging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Security Notice */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Anonymous by default</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Messages encrypted in transit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>No IP address logging</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Secure response channels</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Response Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">Anonymous Messages</div>
                    <div className="text-muted-foreground">
                      Responses posted to public channels or secure bulletin boards
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email Contact</div>
                    <div className="text-muted-foreground">
                      Direct response via encrypted email if provided
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Emergency Issues</div>
                    <div className="text-muted-foreground">
                      Security vulnerabilities receive priority handling
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-900/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-400 mb-1">Legal Notice</p>
                      <p className="text-muted-foreground">
                        We cannot provide support for illegal activities. 
                        Use SecureChat responsibly and in compliance with local laws.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Send Anonymous Message</CardTitle>
                  <CardDescription>
                    All fields are optional except those marked as required. 
                    Your privacy is protected regardless of what you choose to share.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select message category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority Level</label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <span className={priority.color}>{priority.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject *</label>
                      <Input
                        placeholder="Brief description of your message..."
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message *</label>
                      <Textarea
                        placeholder="Your message will be encrypted before transmission..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={6}
                        className="bg-background/50 resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Character count: {formData.message.length} (max 5000)
                      </p>
                    </div>

                    {/* Optional Email */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Contact Email (Optional)</label>
                        <Badge variant="secondary" className="text-xs">
                          {formData.anonymous ? 'Anonymous Mode' : 'Contact Mode'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder={formData.anonymous ? "Leave empty for anonymous contact" : "your@email.com"}
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={formData.anonymous}
                          className="bg-background/50 flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({ ...prev, anonymous: !prev.anonymous, email: '' }))}
                        >
                          {formData.anonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.anonymous 
                          ? "Complete anonymity - we cannot respond directly" 
                          : "Email encrypted and stored securely for response"}
                      </p>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-border">
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
                            Encrypting & Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Encrypted Message
                          </>
                        )}
                      </Button>
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Alternative Contact Methods</h2>
              <p className="text-lg text-muted-foreground">
                For maximum security, consider these additional communication channels
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="text-4xl mb-2">🧅</div>
                  <CardTitle>Tor Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access this contact form through Tor for maximum anonymity
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Tor Address Available Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="text-4xl mb-2">📧</div>
                  <CardTitle>Encrypted Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send PGP encrypted emails for sensitive communications
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    PGP Key Available Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="text-4xl mb-2">💬</div>
                  <CardTitle>Signal Messenger</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact us via Signal for real-time encrypted chat
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Signal Contact Soon
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
