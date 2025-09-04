type Quality = 'excellent' | 'good' | 'fair' | 'poor';

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
  quality: Quality;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  dc?: RTCDataChannel;
  remoteStream: MediaStream;
  isInitiator: boolean;
  lastQuality?: Quality;
}

interface SignalMessage {
  type: 'hello' | 'offer' | 'answer' | 'ice' | 'bye';
  roomId: string;
  from: string;
  to?: string;
  payload?: any;
}

class WebRTCService {
  private static instance: WebRTCService;
  private localStream: MediaStream | null = null;
  private peers: Map<string, PeerEntry> = new Map();
  private mediaSettings: MediaSettings = { video: true, audio: true, screenShare: false };
  private roomId: string | null = null;
  private userId: string | null = null;
  private bc: BroadcastChannel | null = null;
  private statsInterval: any = null;

  private streamHandlers: Set<(userId: string, stream: MediaStream) => void> = new Set();
  private userHandlers: Set<(users: CallUser[]) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private messageHandlers: Set<(from: string, message: string) => void> = new Set();

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  async initializeMedia(settings: Partial<MediaSettings> = {}): Promise<MediaStream> {
    this.mediaSettings = { ...this.mediaSettings, ...settings };
    const constraints: MediaStreamConstraints = {
      video: this.mediaSettings.video ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false,
      audio: this.mediaSettings.audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
    };
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.emitUsers();
    return this.localStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async join(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
    if (this.bc) this.bc.close();
    this.bc = new BroadcastChannel(`webrtc-room-${roomId}`);
    this.bc.onmessage = (ev: MessageEvent<SignalMessage>) => this.onSignal(ev.data);

    this.bc.postMessage({ type: 'hello', roomId, from: userId } as SignalMessage);
    this.connectionHandlers.forEach(h => h(true));
    this.startStatsLoop();
  }

  leave() {
    if (this.bc && this.userId && this.roomId) {
      this.bc.postMessage({ type: 'bye', roomId: this.roomId, from: this.userId } as SignalMessage);
    }
    this.stopStatsLoop();
    this.peers.forEach((p) => p.pc.close());
    this.peers.clear();
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    this.connectionHandlers.forEach(h => h(false));
    this.emitUsers();
  }

  toggleVideo(): boolean {
    const enabled = this.toggleTrack('video');
    this.mediaSettings.video = enabled;
    return enabled;
  }

  toggleAudio(): boolean {
    const enabled = this.toggleTrack('audio');
    this.mediaSettings.audio = enabled;
    return enabled;
  }

  private toggleTrack(kind: 'video' | 'audio'): boolean {
    if (!this.localStream) return false;
    const track = kind === 'video' ? this.localStream.getVideoTracks()[0] : this.localStream.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    this.emitUsers();
    return track.enabled;
  }

  async startScreenShare(): Promise<void> {
    if (!this.localStream) throw new Error('No local stream');
    const screen = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
    const videoTrack = screen.getVideoTracks()[0];
    this.replaceVideoTrack(videoTrack);
    this.mediaSettings.screenShare = true;
    this.emitUsers();
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localStream) return;
    const cam = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = cam.getVideoTracks()[0];
    this.replaceVideoTrack(videoTrack);
    this.mediaSettings.screenShare = false;
    this.emitUsers();
  }

  private replaceVideoTrack(videoTrack: MediaStreamTrack) {
    if (!this.localStream) return;
    const old = this.localStream.getVideoTracks()[0];
    if (old) this.localStream.removeTrack(old);
    this.localStream.addTrack(videoTrack);
    this.peers.forEach(({ pc }) => {
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    });
  }

  onStream(handler: (userId: string, stream: MediaStream) => void): () => void {
    this.streamHandlers.add(handler);
    return () => this.streamHandlers.delete(handler);
  }

  onUsers(handler: (users: CallUser[]) => void): () => void {
    this.userHandlers.add(handler);
    handler(this.buildUsers());
    return () => this.userHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onMessage(handler: (from: string, message: string) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  sendMessage(message: string) {
    this.peers.forEach(({ dc }) => {
      try { dc?.readyState === 'open' && dc.send(message); } catch {}
    });
  }

  private async ensurePeer(peerId: string, initiator: boolean): Promise<PeerEntry> {
    if (this.peers.has(peerId)) return this.peers.get(peerId)!;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const remoteStream = new MediaStream();

    pc.onicecandidate = (e) => {
      if (e.candidate && this.bc && this.roomId && this.userId) {
        this.bc.postMessage({ type: 'ice', roomId: this.roomId, from: this.userId, to: peerId, payload: e.candidate } as SignalMessage);
      }
    };

    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach(() => {});
      const stream = e.streams[0] || remoteStream;
      stream.addTrack(e.track);
      this.streamHandlers.forEach(h => h(peerId, stream));
    };

    pc.ondatachannel = (e) => {
      const dc = e.channel;
      this.attachDataChannel(peerId, dc);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream!));
    }

    const entry: PeerEntry = { pc, remoteStream, isInitiator: initiator };

    if (initiator) {
      const dc = pc.createDataChannel('chat');
      this.attachDataChannel(peerId, dc);
    }

    this.peers.set(peerId, entry);
    this.emitUsers();
    return entry;
  }

  private attachDataChannel(peerId: string, dc: RTCDataChannel) {
    const entry = this.peers.get(peerId);
    if (!entry) return;
    entry.dc = dc;
    dc.onmessage = (ev) => this.messageHandlers.forEach(h => h(peerId, ev.data));
    dc.onopen = () => {};
    dc.onclose = () => {};
  }

  private async onSignal(msg: SignalMessage) {
    if (!this.roomId || !this.userId) return;
    if (msg.roomId !== this.roomId || msg.from === this.userId) return;

    if (msg.type === 'hello') {
      const initiator = this.userId > msg.from; // deterministic initiator
      await this.ensurePeer(msg.from, initiator);
      if (initiator) {
        const offer = await this.peers.get(msg.from)!.pc.createOffer();
        await this.peers.get(msg.from)!.pc.setLocalDescription(offer);
        this.bc!.postMessage({ type: 'offer', roomId: this.roomId, from: this.userId, to: msg.from, payload: offer } as SignalMessage);
      }
      return;
    }

    if (msg.to && msg.to !== this.userId) return;

    if (msg.type === 'offer') {
      await this.ensurePeer(msg.from, false);
      const pc = this.peers.get(msg.from)!.pc;
      await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.bc!.postMessage({ type: 'answer', roomId: this.roomId, from: this.userId, to: msg.from, payload: answer } as SignalMessage);
      return;
    }

    if (msg.type === 'answer') {
      const pc = this.peers.get(msg.from)?.pc;
      if (pc && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
      }
      return;
    }

    if (msg.type === 'ice') {
      const pc = this.peers.get(msg.from)?.pc;
      if (pc && msg.payload) {
        try { await pc.addIceCandidate(new RTCIceCandidate(msg.payload)); } catch {}
      }
      return;
    }

    if (msg.type === 'bye') {
      const entry = this.peers.get(msg.from);
      if (entry) {
        entry.pc.close();
        this.peers.delete(msg.from);
        this.emitUsers();
      }
      return;
    }
  }

  private startStatsLoop() {
    this.stopStatsLoop();
    this.statsInterval = setInterval(async () => {
      await Promise.all(Array.from(this.peers.entries()).map(async ([peerId, { pc }]) => {
        try {
          const stats = await pc.getStats();
          let bitrate = 0;
          stats.forEach((report: any) => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              bitrate = report.bytesReceived || 0;
            }
          });
          const quality: Quality = bitrate > 5_000_000 ? 'excellent' : bitrate > 1_000_000 ? 'good' : bitrate > 250_000 ? 'fair' : 'poor';
          const entry = this.peers.get(peerId);
          if (entry && entry.lastQuality !== quality) {
            entry.lastQuality = quality;
            this.emitUsers();
          }
        } catch {}
      }));
    }, 3000);
  }

  private stopStatsLoop() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private buildUsers(): CallUser[] {
    const users: CallUser[] = [];
    if (this.userId) {
      users.push({
        id: this.userId,
        stream: this.localStream || undefined,
        isConnected: true,
        mediaSettings: { ...this.mediaSettings },
        quality: 'excellent'
      });
    }
    this.peers.forEach((entry, id) => {
      users.push({
        id,
        stream: entry.remoteStream,
        isConnected: true,
        mediaSettings: { video: true, audio: true, screenShare: false },
        quality: entry.lastQuality || 'good'
      });
    });
    return users;
  }

  private emitUsers() {
    const users = this.buildUsers();
    this.userHandlers.forEach(h => h(users));
  }
}

export const webrtcService = WebRTCService.getInstance();
