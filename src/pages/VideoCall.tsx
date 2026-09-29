import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CallInterface, { type CallState, type CallParticipant } from '@/components/CallInterface';
import { webrtcService } from '@/lib/webrtc';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const isAudioOnly = searchParams.get('audio') === 'true';

  const [callState, setCallState] = useState<CallState>({
    id: roomId || 'call-' + Date.now(),
    type: isAudioOnly ? 'audio' : 'video',
    status: 'connecting',
    duration: 0,
    participants: [],
    isGroupCall: false,
    isRecording: false,
    isPaused: false
  });

  useEffect(() => {
    let unsubUsers: (() => void) | null = null;
    let unsubConn: (() => void) | null = null;

    const init = async () => {
      try {
        await webrtcService.initializeMedia({ video: !isAudioOnly, audio: true });
        const uid = user?.id || user?.userId || 'user-' + Math.random().toString(36).slice(2, 8);
        await webrtcService.join(roomId || callState.id, uid);

        unsubUsers = webrtcService.onUsers((users) => {
          const participants: CallParticipant[] = users.map((u) => ({
            id: u.id,
            name: u.id === uid ? (user?.nickname || 'You') : `User ${u.id.slice(-4)}`,
            avatar: u.id === uid ? user?.avatar : undefined,
            isVideoEnabled: !!u.mediaSettings.video,
            isAudioEnabled: !!u.mediaSettings.audio,
            isScreenSharing: !!u.mediaSettings.screenShare,
            connectionQuality: u.quality,
            isLocal: u.id === uid,
          }));

          setCallState((prev) => ({
            ...prev,
            participants,
            isGroupCall: participants.length > 2,
          }));
        });

        unsubConn = webrtcService.onConnection((connected) => {
          if (connected) {
            setCallState((prev) => ({ ...prev, status: 'connected', startTime: new Date() }));
            toast({ title: 'Call Connected', description: `${isAudioOnly ? 'Audio' : 'Video'} call established.` });
          } else {
            setCallState((prev) => ({ ...prev, status: 'ended' }));
          }
        });
      } catch (e) {
        setCallState((prev) => ({ ...prev, status: 'failed' }));
        toast({ title: 'Call Failed', description: 'Unable to access camera/microphone', variant: 'destructive' });
      }
    };

    init();

    return () => {
      unsubUsers?.();
      unsubConn?.();
      webrtcService.leave();
    };
  }, [roomId, isAudioOnly, user, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.status === 'connected' && callState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callState.startTime!.getTime()) / 1000);
        setCallState((prev) => ({ ...prev, duration }));
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [callState.status, callState.startTime]);

  const handleEndCall = () => {
    webrtcService.leave();
    setCallState((prev) => ({ ...prev, status: 'ended' }));
    toast({
      title: 'Call Ended',
      description: `Call duration: ${Math.floor(callState.duration / 60)}:${(callState.duration % 60)
        .toString()
        .padStart(2, '0')}`,
    });
    setTimeout(() => navigate(-1), 1000);
  };

  const handleToggleVideo = (enabled: boolean) => {
    const state = webrtcService.toggleVideo();
    const effective = typeof enabled === 'boolean' ? enabled : state;
    setCallState((prev) => ({
      ...prev,
      type: !effective ? 'audio' : 'video',
      participants: prev.participants.map((p) => (p.isLocal ? { ...p, isVideoEnabled: effective } : p)),
    }));
  };

  const handleToggleAudio = (enabled: boolean) => {
    const state = webrtcService.toggleAudio();
    const effective = typeof enabled === 'boolean' ? enabled : state;
    setCallState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.isLocal ? { ...p, isAudioEnabled: effective } : p)),
    }));
  };

  const handleToggleScreenShare = async (enabled: boolean) => {
    try {
      if (enabled) {
        await webrtcService.startScreenShare();
      } else {
        await webrtcService.stopScreenShare();
      }
      setCallState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) => (p.isLocal ? { ...p, isScreenSharing: enabled } : p)),
      }));
      if (enabled) {
        toast({ title: 'Screen Sharing Started', description: 'Your screen is now visible to all participants.' });
      }
    } catch (e) {
      toast({ title: 'Screen Share Failed', description: 'Permission denied or not supported', variant: 'destructive' });
    }
  };

  const handleInviteParticipant = (userId: string) => {
    toast({ title: 'Invite', description: `Share this link to invite: ${window.location.origin}/video/${roomId}` });
  };

  const handleToggleRecording = (enabled: boolean) => {
    setCallState((prev) => ({ ...prev, isRecording: enabled }));
    toast({ title: enabled ? 'Recording Started' : 'Recording Stopped' });
  };

  const handleSendMessage = (message: string) => {
    webrtcService.sendMessage(message);
  };

  if (callState.status === 'failed') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Call Failed</h2>
          <p className="text-muted-foreground">Unable to establish connection</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (callState.status === 'ended') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Call Ended</h2>
          <p className="text-muted-foreground">
            Duration: {Math.floor(callState.duration / 60)}:{(callState.duration % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <CallInterface
      callState={callState}
      currentUserId={user?.id || user?.userId || 'current-user'}
      onEndCall={handleEndCall}
      onToggleVideo={handleToggleVideo}
      onToggleAudio={handleToggleAudio}
      onToggleScreenShare={handleToggleScreenShare}
      onInviteParticipant={handleInviteParticipant}
      onToggleRecording={handleToggleRecording}
      onSendMessage={handleSendMessage}
    />
  );
};

export default VideoCall;
