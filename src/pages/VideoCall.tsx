import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CallInterface, { type CallState, type CallParticipant } from '@/components/CallInterface';

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

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Simulate initializing call participants
        const participants: CallParticipant[] = [
          {
            id: user?.id || 'current-user',
            name: user?.nickname || 'You',
            avatar: user?.avatar,
            isVideoEnabled: !isAudioOnly,
            isAudioEnabled: true,
            isScreenSharing: false,
            connectionQuality: 'excellent',
            isLocal: true
          }
        ];

        // Add other participants (simulated)
        if (roomId) {
          participants.push({
            id: 'remote-user-1',
            name: `User ${roomId.slice(-4)}`,
            isVideoEnabled: !isAudioOnly,
            isAudioEnabled: true,
            isScreenSharing: false,
            connectionQuality: 'good',
            isLocal: false
          });
        }

        setCallState(prev => ({
          ...prev,
          status: 'ringing',
          participants,
          isGroupCall: participants.length > 2
        }));

        // Simulate connection delay
        setTimeout(() => {
          setCallState(prev => ({
            ...prev,
            status: 'connected',
            startTime: new Date()
          }));

          toast({
            title: "Call Connected",
            description: `${isAudioOnly ? 'Audio' : 'Video'} call established successfully.`,
          });
        }, 2000);

      } catch (error) {
        setCallState(prev => ({
          ...prev,
          status: 'failed'
        }));

        toast({
          title: "Call Failed",
          description: "Unable to establish connection. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeCall();
  }, [roomId, isAudioOnly, user, toast]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState.status === 'connected' && callState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callState.startTime!.getTime()) / 1000);
        setCallState(prev => ({ ...prev, duration }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.status, callState.startTime]);

  const handleEndCall = () => {
    setCallState(prev => ({ ...prev, status: 'ended' }));
    
    toast({
      title: "Call Ended",
      description: `Call duration: ${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}`,
    });

    // Navigate back after a brief delay
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  const handleToggleVideo = (enabled: boolean) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.isLocal ? { ...p, isVideoEnabled: enabled } : p
      )
    }));

    // Update call type if video is disabled
    if (!enabled && callState.type === 'video') {
      setCallState(prev => ({ ...prev, type: 'audio' }));
    } else if (enabled && callState.type === 'audio') {
      setCallState(prev => ({ ...prev, type: 'video' }));
    }
  };

  const handleToggleAudio = (enabled: boolean) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.isLocal ? { ...p, isAudioEnabled: enabled } : p
      )
    }));
  };

  const handleToggleScreenShare = (enabled: boolean) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.isLocal ? { ...p, isScreenSharing: enabled } : p
      )
    }));

    if (enabled) {
      toast({
        title: "Screen Sharing Started",
        description: "Your screen is now visible to all participants.",
      });
    }
  };

  const handleInviteParticipant = (userId: string) => {
    // In a real implementation, this would send an invitation
    const newParticipant: CallParticipant = {
      id: `invited-${Date.now()}`,
      name: userId,
      isVideoEnabled: callState.type === 'video',
      isAudioEnabled: true,
      isScreenSharing: false,
      connectionQuality: 'good',
      isLocal: false
    };

    setCallState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
      isGroupCall: prev.participants.length + 1 > 2
    }));

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${userId}.`,
    });
  };

  const handleToggleRecording = (enabled: boolean) => {
    setCallState(prev => ({ ...prev, isRecording: enabled }));

    toast({
      title: enabled ? "Recording Started" : "Recording Stopped",
      description: enabled 
        ? "This call is now being recorded. All participants have been notified."
        : "Call recording has been stopped.",
      variant: enabled ? "default" : "destructive"
    });
  };

  const handleSendMessage = (message: string) => {
    // In a real implementation, this would send the message through WebRTC data channel
    console.log('Sending chat message:', message);
  };

  // Handle failed call
  if (callState.status === 'failed') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Call Failed</h2>
          <p className="text-muted-foreground">Unable to establish connection</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle ended call
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
      currentUserId={user?.id || 'current-user'}
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
