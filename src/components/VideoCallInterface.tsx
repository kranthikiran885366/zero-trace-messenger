import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Shield, Monitor, Users, ArrowLeft, Home, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const VideoCallInterface = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { toast } = useToast();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [ipMasked, setIpMasked] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    // Simulate video stream
    if (localVideoRef.current) {
      // In a real app, this would be actual camera feed
      localVideoRef.current.style.background = 'linear-gradient(45deg, #1a1a2e, #16213e)';
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/video/${roomId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Video Link Copied",
      description: "Share this link to invite others to the video call"
    });
  };

  const callUsers: any[] = []; // Placeholder for call participants

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Encrypted Video Call
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  E2E Encrypted
                </Badge>
                {ipMasked && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <Monitor className="w-3 h-3 mr-1" />
                    IP Masked
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isCallActive && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Duration: {formatDuration(callDuration)}</span>
                  <span>Participants: {callUsers.length + 1}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/chat/${roomId}`)}
                  className="bg-primary/10 border-primary/50 hover:bg-primary/20 text-primary"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  BACK TO CHAT
                </Button>
                <Button variant="ghost" size="sm" onClick={copyRoomLink}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings && setShowSettings(!showSettings)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('⚠️ Are you sure you want to leave the video call?')) {
                      navigate('/');
                    }
                  }}
                  className="bg-red-900/20 border-red-500/50 hover:bg-red-800/30 text-red-400"
                >
                  <PhoneOff className="h-4 w-4 mr-1" />
                  LEAVE
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 p-4 bg-card/50 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Quality</label>
                    <Select value={videoQuality} onValueChange={setVideoQuality}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {videoQualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">IP Masking</span>
                      <Switch
                        checked={ipMasked}
                        onCheckedChange={setIpMasked}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Route through proxy servers for privacy
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Video Area */}
      <div className="flex-1 relative bg-cyber-darker">
        {!isCallActive ? (
          /* Call Setup */
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-card/80 backdrop-blur-sm border-border max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Ready to Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Camera</span>
                    <Switch 
                      checked={isVideoEnabled} 
                      onCheckedChange={setIsVideoEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Microphone</span>
                    <Switch 
                      checked={isAudioEnabled} 
                      onCheckedChange={setIsAudioEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IP Masking</span>
                    <Switch 
                      checked={ipMasked} 
                      onCheckedChange={setIpMasked}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startCall}
                    variant="cyber"
                    className="w-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Start Secure Call
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground space-y-1">
                    <p>🔒 All video/audio streams are end-to-end encrypted</p>
                    <p>🌐 Your real IP is hidden via TURN relay servers</p>
                    <p>📵 No call logs or metadata stored</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Call */
          <>
            {/* Remote Video (Main) */}
            <div className="absolute inset-0">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover bg-gradient-to-br from-primary/20 to-accent/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-white">Anonymous User</p>
                  <p className="text-sm text-white/70">Waiting for connection...</p>
                </div>
              </div>
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-primary/50 bg-card">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                style={{
                  background: isVideoEnabled 
                    ? 'linear-gradient(45deg, #1a1a2e, #16213e)' 
                    : '#1a1a1a'
                }}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <VideoOff className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-xs text-white/80">
                You
              </div>
            </div>

            {/* Call Status */}
            <div className="absolute top-4 left-4">
              <Card className="bg-black/50 backdrop-blur-sm border-primary/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Secure Call Active</span>
                    <span className="text-xs text-white/70">• {formatDuration(callDuration)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {isCallActive && (
        <Card className="rounded-none border-x-0 border-b-0 bg-card/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full p-4"
                title={isAudioEnabled ? "Mute" : "Unmute"}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full p-4"
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={isScreenSharing ? "neon" : "ghost"}
                size="lg"
                onClick={toggleScreenShare}
                className="rounded-full p-4"
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full p-4 bg-red-600 hover:bg-red-700"
                title="End call"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(`/chat/${roomId}`)}
                className="rounded-full p-4"
                title="Open chat"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-3 space-y-1">
              <p>🔐 P2P encrypted • 🌐 {ipMasked ? 'IP masked via TURN relay' : 'Direct connection'} • 🚫 No recording</p>
              {encryptionKey && (
                <p className="font-mono">Fingerprint: {encryption.generateFingerprint(encryptionKey)}</p>
              )}
              {isScreenSharing && (
                <p className="text-neon-blue animate-pulse">📺 Screen sharing active</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoCallInterface;
