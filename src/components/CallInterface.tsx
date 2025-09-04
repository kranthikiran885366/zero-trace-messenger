import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  Settings,
  Users,
  MessageSquare,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Camera,
  CameraOff,
  MoreVertical,
  CircleDot,
  Square,
  UserPlus,
  Expand,
  Shrink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { webrtcService } from '@/lib/webrtc';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isLocal?: boolean;
}

export interface CallState {
  id: string;
  type: 'audio' | 'video';
  status: 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed';
  startTime?: Date;
  duration: number;
  participants: CallParticipant[];
  isGroupCall: boolean;
  isRecording: boolean;
  isPaused: boolean;
}

interface CallInterfaceProps {
  callState: CallState;
  currentUserId: string;
  onEndCall: () => void;
  onToggleVideo: (enabled: boolean) => void;
  onToggleAudio: (enabled: boolean) => void;
  onToggleScreenShare: (enabled: boolean) => void;
  onInviteParticipant: (userId: string) => void;
  onToggleRecording: (enabled: boolean) => void;
  onSendMessage?: (message: string) => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
  callState,
  currentUserId,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onInviteParticipant,
  onToggleRecording,
  onSendMessage
}) => {
  const { toast } = useToast();
  const [isVideoEnabled, setIsVideoEnabled] = useState(callState.type === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState<'speaker' | 'grid' | 'sidebar'>('speaker');
  const [chatMessage, setChatMessage] = useState('');
  const [inviteId, setInviteId] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const currentUser = callState.participants.find(p => p.id === currentUserId);
  const otherParticipants = callState.participants.filter(p => p.id !== currentUserId);

  useEffect(() => {
    const local = webrtcService.getLocalStream();
    if (local && localVideoRef.current) {
      localVideoRef.current.srcObject = local;
    }
    const off = webrtcService.onStream((userId, stream) => {
      const el = remoteVideoRefs.current[userId];
      if (el) {
        el.srcObject = stream;
      }
    });
    return () => {
      off();
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleVideo = () => {
    const enabled = webrtcService.toggleVideo();
    setIsVideoEnabled(enabled);
    onToggleVideo(enabled);
    toast({ title: enabled ? 'Camera On' : 'Camera Off', description: enabled ? 'Your video is now visible' : 'Your video is now hidden' });
  };

  const handleToggleAudio = () => {
    const enabled = webrtcService.toggleAudio();
    setIsAudioEnabled(enabled);
    onToggleAudio(enabled);
    toast({ title: enabled ? 'Microphone On' : 'Microphone Off', description: enabled ? 'You can now speak' : 'You are now muted' });
  };

  const handleToggleScreenShare = async () => {
    const enable = !isScreenSharing;
    try {
      if (enable) {
        await webrtcService.startScreenShare();
      } else {
        await webrtcService.stopScreenShare();
      }
      setIsScreenSharing(enable);
      onToggleScreenShare(enable);
      toast({ title: enable ? 'Screen Sharing Started' : 'Screen Sharing Stopped', description: enable ? 'Your screen is now visible to all participants' : 'Screen sharing has been stopped' });
    } catch (e) {
      toast({ title: 'Screen Share Error', description: 'Permission denied or not supported', variant: 'destructive' });
    }
  };

  const handleSendChatMessage = () => {
    if (chatMessage.trim() && onSendMessage) {
      onSendMessage(chatMessage);
      setChatMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent to all participants.",
      });
    }
  };

  const handleInviteParticipant = () => {
    if (inviteId.trim()) {
      onInviteParticipant(inviteId);
      setInviteId('');
      setShowInvite(false);
      toast({
        title: "Invitation Sent",
        description: "Participant has been invited to the call.",
      });
    }
  };

  const getConnectionQualityColor = (quality: CallParticipant['connectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const renderParticipantVideo = (participant: CallParticipant, isLarge = false) => (
    <div
      key={participant.id}
      className={cn(
        "relative rounded-lg overflow-hidden bg-accent/20",
        isLarge ? "aspect-video" : "aspect-square"
      )}
    >
      {participant.isVideoEnabled ? (
        <video
          ref={participant.isLocal ? localVideoRef : (el) => {
            remoteVideoRefs.current[participant.id] = el;
          }}
          autoPlay
          muted={participant.isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-accent/50">
          <Avatar className={cn("border-2 border-background", isLarge ? "h-24 w-24" : "h-16 w-16")}>
            <AvatarImage src={participant.avatar} />
            <AvatarFallback className={isLarge ? "text-2xl" : "text-lg"}>
              {participant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {participant.name}
          {participant.isLocal && " (You)"}
        </Badge>
        <div className="flex items-center gap-1">
          {!participant.isAudioEnabled && (
            <MicOff className="h-3 w-3 text-red-500" />
          )}
          {participant.isScreenSharing && (
            <Monitor className="h-3 w-3 text-blue-500" />
          )}
          <div className={cn("w-2 h-2 rounded-full", getConnectionQualityColor(participant.connectionQuality))} />
        </div>
      </div>

      {/* Screen sharing indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-blue-500 text-white">
            <Monitor className="h-3 w-3 mr-1" />
            Screen
          </Badge>
        </div>
      )}
    </div>
  );

  if (callState.status === 'connecting' || callState.status === 'ringing') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/90 to-accent/10">
        <Card className="p-8 text-center space-y-6 max-w-md">
          <div className="space-y-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={otherParticipants[0]?.avatar} />
              <AvatarFallback className="text-2xl">
                {otherParticipants[0]?.name.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {callState.status === 'connecting' ? 'Connecting...' : 'Calling...'}
              </h2>
              <p className="text-muted-foreground">
                {otherParticipants[0]?.name || 'Unknown User'}
              </p>
              {callState.isGroupCall && (
                <Badge variant="secondary" className="mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  Group Call
                </Badge>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={onEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {callState.isGroupCall ? `Group Call (${callState.participants.length})` : otherParticipants[0]?.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDuration(callState.duration)}</span>
                {callState.isRecording && (
                  <Badge variant="destructive" className="text-xs">
                    <CircleDot className="h-3 w-3 mr-1" />
                    REC
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {isVideoEnabled ? 'Video' : 'Audio'} Call
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callState.isGroupCall && (
              <Button variant="ghost" size="sm" onClick={() => setShowInvite(true)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLayout('speaker')}>
                  Speaker View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout('grid')}>
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout('sidebar')}>
                  Sidebar View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
              className={showChat ? "bg-accent" : ""}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={cn("flex-1 p-4", showChat && "mr-80")}>
          {layout === 'speaker' && (
            <div className="h-full space-y-4">
              {/* Main Speaker */}
              <div className="flex-1">
                {renderParticipantVideo(
                  isScreenSharing && currentUser
                    ? currentUser
                    : otherParticipants.find(p => p.isScreenSharing) || otherParticipants[0] || currentUser!,
                  true
                )}
              </div>
              
              {/* Participant Strip */}
              {callState.participants.length > 1 && (
                <div className="flex gap-4 h-24">
                  {callState.participants
                    .filter(p => p.id !== (isScreenSharing && currentUser ? currentUser.id : otherParticipants.find(p => p.isScreenSharing)?.id || otherParticipants[0]?.id))
                    .map(participant => renderParticipantVideo(participant))
                  }
                </div>
              )}
            </div>
          )}

          {layout === 'grid' && (
            <div className={cn(
              "grid gap-4 h-full",
              callState.participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
              callState.participants.length <= 4 ? "grid-cols-2" :
              callState.participants.length <= 9 ? "grid-cols-3" : "grid-cols-4"
            )}>
              {callState.participants.map(participant => renderParticipantVideo(participant, true))}
            </div>
          )}

          {layout === 'sidebar' && (
            <div className="h-full flex gap-4">
              <div className="flex-1">
                {renderParticipantVideo(otherParticipants[0] || currentUser!, true)}
              </div>
              <div className="w-48 space-y-4">
                {callState.participants
                  .filter(p => p.id !== (otherParticipants[0]?.id || currentUser!.id))
                  .map(participant => renderParticipantVideo(participant))
                }
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 border-l border-border bg-card/30 flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Call Chat</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <Button onClick={handleSendChatMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Control */}
          <Button
            onClick={handleToggleAudio}
            variant={isAudioEnabled ? "outline" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Video Control */}
          <Button
            onClick={handleToggleVideo}
            variant={isVideoEnabled ? "outline" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={handleToggleScreenShare}
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </Button>

          {/* Speaker Control */}
          <Button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            variant={isSpeakerOn ? "outline" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          {/* Record */}
          <Button
            onClick={() => onToggleRecording(!callState.isRecording)}
            variant={callState.isRecording ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {callState.isRecording ? <Square className="h-6 w-6" /> : <CircleDot className="h-6 w-6" />}
          </Button>

          {/* End Call */}
          <Button
            onClick={onEndCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-16 h-16 ml-4"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Participant</DialogTitle>
            <DialogDescription>
              Enter the user ID or username to invite to this call.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="User ID or username"
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleInviteParticipant} className="flex-1">
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Quality</label>
              <select className="w-full p-2 border border-border rounded-md bg-background">
                <option>Auto</option>
                <option>720p</option>
                <option>480p</option>
                <option>360p</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Quality</label>
              <select className="w-full p-2 border border-border rounded-md bg-background">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <Button onClick={() => setShowSettings(false)} className="w-full">
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallInterface;
