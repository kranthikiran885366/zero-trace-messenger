import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Palette, Languages, BellRing, Shield, Image as ImageIcon, Type } from 'lucide-react';

const wallpapers = [
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    url: 'https://images.pexels.com/photos/1181314/pexels-photo-1181314.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    url: 'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'mountain',
    name: 'Mountains',
    url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'city',
    name: 'Neo City',
    url: 'https://images.pexels.com/photos/316093/pexels-photo-316093.jpeg?auto=compress&cs=tinysrgb&w=1600'
  }
];

const accentOptions = [
  { id: '#10b981', name: 'Emerald' },
  { id: '#3b82f6', name: 'Blue' },
  { id: '#8b5cf6', name: 'Violet' },
  { id: '#ef4444', name: 'Red' },
  { id: '#f59e0b', name: 'Amber' },
];

const SettingsPage: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { toast } = useToast();

  const [darkMode, setDarkMode] = useState<boolean>(document.documentElement.classList.contains('dark'));
  const [accent, setAccent] = useState<string>('#10b981');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [language, setLanguage] = useState<string>(navigator.language || 'en-US');
  const [wallpaper, setWallpaper] = useState<string>('');
  const [readReceipts, setReadReceipts] = useState<boolean>(true);
  const [typingIndicators, setTypingIndicators] = useState<boolean>(true);
  const [disappearingMessages, setDisappearingMessages] = useState<boolean>(false);
  const [disappearAfter, setDisappearAfter] = useState<number>(86400);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (user?.preferences) {
      setAccent((user.preferences as any).accentColor || accent);
      setFontSize(((user as any).theme?.fontSize || 'medium') as any);
      setWallpaper((user.preferences as any).wallpaper || '');
      setReadReceipts((user.preferences as any).readReceipts ?? true);
      setTypingIndicators((user.preferences as any).typingIndicators ?? true);
      setDisappearingMessages((user.preferences as any).disappearingMessages ?? false);
      setDisappearAfter((user.preferences as any).disappearAfter || 86400);
      setSoundsEnabled((user.preferences as any).soundsEnabled ?? true);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (wallpaper) {
      document.body.style.backgroundImage = `url('${wallpaper}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
    }
  }, [wallpaper]);

  const savePreferences = async () => {
    await updatePreferences({
      theme: darkMode ? 'dark' : 'light',
      accentColor: accent,
      wallpaper,
      fontSize,
      language,
      readReceipts,
      typingIndicators,
      disappearingMessages,
      disappearAfter,
      soundsEnabled,
      pushEnabled
    } as any);
  };

  const requestPushPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        const enabled = permission === 'granted';
        setPushEnabled(enabled);
        toast({ title: enabled ? 'Push Enabled' : 'Push Denied' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Settings</Badge>
            <h1 className="text-2xl font-bold">Personalize Your SecureChat</h1>
            <p className="text-muted-foreground">Themes, notifications, privacy, and more</p>
          </div>

          <Tabs defaultValue="appearance">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Privacy
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellRing className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4" /> Language
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme & Colors</CardTitle>
                  <CardDescription>Choose dark or light mode and accent color</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between dark and light theme</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-2">Accent Color</p>
                    <div className="flex gap-2 flex-wrap">
                      {accentOptions.map(opt => (
                        <button
                          key={opt.id}
                          className={`h-8 px-3 rounded-md border ${accent === opt.id ? 'ring-2 ring-primary' : ''}`}
                          style={{ backgroundColor: opt.id }}
                          onClick={() => setAccent(opt.id)}
                          title={opt.name}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Wallpaper</CardTitle>
                  <CardDescription>Set a background image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3">
                    {wallpapers.map(w => (
                      <button
                        key={w.id}
                        className={`rounded-lg overflow-hidden border ${wallpaper === w.url ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setWallpaper(w.url)}
                        title={w.name}
                      >
                        <img src={w.url} alt={w.name} className="w-full h-24 object-cover" />
                        <div className="p-2 text-left text-sm">{w.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Custom image URL" value={wallpaper} onChange={(e) => setWallpaper(e.target.value)} />
                    <Button variant="outline" onClick={() => setWallpaper('')}>Clear</Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium">Font Size</p>
                      <Select value={fontSize} onValueChange={(v) => setFontSize(v as any)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Controls</CardTitle>
                  <CardDescription>Manage read receipts, typing indicators and disappearing messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Read Receipts</p>
                      <p className="text-sm text-muted-foreground">Allow others to see when you read their messages</p>
                    </div>
                    <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Typing Indicators</p>
                      <p className="text-sm text-muted-foreground">Show when you are typing</p>
                    </div>
                    <Switch checked={typingIndicators} onCheckedChange={setTypingIndicators} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Disappearing Messages</p>
                      <p className="text-sm text-muted-foreground">Automatically delete messages after a period</p>
                    </div>
                    <Switch checked={disappearingMessages} onCheckedChange={setDisappearingMessages} />
                  </div>

                  {disappearingMessages && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium">Disappear After</p>
                        <Select value={String(disappearAfter)} onValueChange={(v) => setDisappearAfter(parseInt(v))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3600">1 hour</SelectItem>
                            <SelectItem value="86400">24 hours</SelectItem>
                            <SelectItem value="604800">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Control push notifications and sounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Enable browser notifications</p>
                    </div>
                    <Switch checked={pushEnabled} onCheckedChange={(v) => v ? requestPushPermission() : setPushEnabled(false)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound</p>
                      <p className="text-sm text-muted-foreground">Play a sound for new messages</p>
                    </div>
                    <Switch checked={soundsEnabled} onCheckedChange={setSoundsEnabled} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5" /> Language</CardTitle>
                  <CardDescription>Select your preferred language</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium">Language</p>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="hi-IN">Hindi (IN)</SelectItem>
                          <SelectItem value="te-IN">Telugu (IN)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={savePreferences}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
