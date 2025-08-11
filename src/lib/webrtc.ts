export interface MediaSettings {
  video: boolean;
  audio: boolean;
  screenShare: boolean;
}

export interface CallUser {
  id: string;
  stream?: MediaStream;
  isConnected: boolean;
  mediaSettings: MediaSettings;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private mediaSettings: MediaSettings = { video: true, audio: true, screenShare: false };
  private roomId: string | null = null;
  
  // Event handlers
  private streamHandlers: Set<(userId: string, stream: MediaStream) => void> = new Set();
  private userHandlers: Set<(users: CallUser[]) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  private constructor() {}

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  // Initialize media devices
  async initializeMedia(settings: Partial<MediaSettings> = {}): Promise<MediaStream> {
    this.mediaSettings = { ...this.mediaSettings, ...settings };
    
    try {
      const constraints = {
        video: this.mediaSettings.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: this.mediaSettings.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Failed to access media devices:', error);
      throw new Error('Camera/microphone access denied or not available');
    }
  }

  // Start screen sharing
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in existing connections
      if (this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = Array.from(this.peerConnections.values())[0]
          ?.getSenders()
          .find(s => s.track && s.track.kind === 'video');
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      this.mediaSettings.screenShare = true;
      return screenStream;
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      throw new Error('Screen sharing not supported or denied');
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    if (this.localStream && this.mediaSettings.screenShare) {
      // Re-initialize camera
      await this.initializeMedia({ 
        ...this.mediaSettings, 
        screenShare: false 
      });
      this.mediaSettings.screenShare = false;
    }
  }

  // Join video call
  async joinCall(roomId: string): Promise<void> {
    this.roomId = roomId;
    
    // Simulate joining call
    setTimeout(() => {
      this.connectionHandlers.forEach(handler => handler(true));
      
      // Simulate other users joining
      setTimeout(() => {
        this.simulateRemoteUser();
      }, 2000);
    }, 1000);
  }

  // Leave call
  leaveCall(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.roomId = null;
    this.connectionHandlers.forEach(handler => handler(false));
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.mediaSettings.video = videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.mediaSettings.audio = audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get media settings
  getMediaSettings(): MediaSettings {
    return { ...this.mediaSettings };
  }

  // Check if camera is available
  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  // Check if microphone is available
  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch {
      return false;
    }
  }

  // Simulate remote user for demo
  private simulateRemoteUser(): void {
    const mockUser: CallUser = {
      id: 'remote_user_' + Math.random().toString(36).substr(2, 8),
      isConnected: true,
      mediaSettings: { video: true, audio: true, screenShare: false }
    };

    // Simulate user list update
    this.userHandlers.forEach(handler => handler([mockUser]));
  }

  // Event handlers
  onStream(handler: (userId: string, stream: MediaStream) => void): () => void {
    this.streamHandlers.add(handler);
    return () => this.streamHandlers.delete(handler);
  }

  onUsers(handler: (users: CallUser[]) => void): () => void {
    this.userHandlers.add(handler);
    return () => this.userHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }
}

export const webrtcService = WebRTCService.getInstance();
