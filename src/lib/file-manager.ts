/**
 * Real-time file sharing manager with progress tracking
 */

export interface FileShare {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: number;
  roomId: string;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt?: number;
  isEncrypted: boolean;
  downloadUrl?: string;
  thumbnailUrl?: string;
  status: 'uploading' | 'processing' | 'ready' | 'expired' | 'deleted';
  progress: number; // 0-100
  metadata: {
    duration?: number; // for video/audio files
    dimensions?: { width: number; height: number }; // for images
    pages?: number; // for documents
  };
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  stage: 'uploading' | 'encrypting' | 'processing' | 'complete';
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
}

export interface FileDownloadProgress {
  fileId: string;
  progress: number;
  stage: 'downloading' | 'decrypting' | 'complete';
  speed: number;
  timeRemaining: number;
  error?: string;
}

class RealTimeFileManager {
  private files: Map<string, FileShare> = new Map();
  private uploadProgress: Map<string, FileUploadProgress> = new Map();
  private downloadProgress: Map<string, FileDownloadProgress> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();
  private maxFileSize = 100 * 1024 * 1024; // 100MB
  private allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', '.zip', '.rar'];

  constructor() {
    this.initializeFiles();
    this.startFileSimulation();
  }

  private initializeFiles() {
    // Create some initial files
    const initialFiles = [
      {
        name: 'project_plan.pdf',
        size: 2048576, // 2MB
        type: 'application/pdf',
        uploadedBy: 'Alice',
        roomId: 'room_1'
      },
      {
        name: 'screenshot.png',
        size: 512000, // 512KB
        type: 'image/png',
        uploadedBy: 'Bob',
        roomId: 'room_2'
      },
      {
        name: 'demo_video.mp4',
        size: 15728640, // 15MB
        type: 'video/mp4',
        uploadedBy: 'Charlie',
        roomId: 'room_1'
      }
    ];

    initialFiles.forEach((fileData, index) => {
      const file: FileShare = {
        id: `file_${Date.now()}_${index}`,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        uploadedBy: fileData.uploadedBy,
        uploadedAt: Date.now() - Math.random() * 3600000, // Random time in last hour
        roomId: fileData.roomId,
        downloadCount: Math.floor(Math.random() * 10),
        maxDownloads: Math.random() > 0.5 ? 25 : undefined,
        expiresAt: Math.random() > 0.3 ? Date.now() + 24 * 60 * 60 * 1000 : undefined, // 24 hours
        isEncrypted: true,
        status: 'ready',
        progress: 100,
        metadata: this.generateMetadata(fileData.type, fileData.size)
      };

      this.files.set(file.id, file);
    });
  }

  private generateMetadata(type: string, size: number) {
    const metadata: FileShare['metadata'] = {};

    if (type.startsWith('image/')) {
      metadata.dimensions = {
        width: Math.floor(Math.random() * 2000) + 500,
        height: Math.floor(Math.random() * 2000) + 500
      };
    } else if (type.startsWith('video/') || type.startsWith('audio/')) {
      metadata.duration = Math.floor(Math.random() * 600) + 30; // 30 seconds to 10 minutes
    } else if (type === 'application/pdf') {
      metadata.pages = Math.floor(Math.random() * 50) + 1;
    }

    return metadata;
  }

  private startFileSimulation() {
    // Simulate file activity
    setInterval(() => {
      // Simulate new file uploads
      if (Math.random() < 0.2) {
        this.simulateFileUpload();
      }

      // Simulate file downloads
      if (Math.random() < 0.3) {
        this.simulateFileDownload();
      }

      // Update file expiration
      this.updateFileExpiration();
    }, 5000);
  }

  private simulateFileUpload() {
    const fileNames = [
      'presentation.pptx',
      'data_analysis.xlsx',
      'meeting_notes.docx',
      'budget_report.pdf',
      'team_photo.jpg',
      'tutorial_video.mp4',
      'audio_recording.wav',
      'source_code.zip'
    ];

    const fileTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'image/jpeg',
      'video/mp4',
      'audio/wav',
      'application/zip'
    ];

    const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    const rooms = ['room_1', 'room_2', 'room_3'];

    const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileSize = Math.floor(Math.random() * 20 * 1024 * 1024) + 100000; // 100KB to 20MB

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    // Start upload progress simulation
    const uploadProgress: FileUploadProgress = {
      fileId,
      progress: 0,
      stage: 'uploading',
      speed: Math.floor(Math.random() * 1000000) + 100000, // 100KB/s to 1MB/s
      timeRemaining: 0
    };

    this.uploadProgress.set(fileId, uploadProgress);
    this.emit('upload_started', { fileId, fileName, fileSize });

    // Simulate upload progress
    const updateInterval = setInterval(() => {
      uploadProgress.progress += Math.random() * 15 + 5; // 5-20% per update
      uploadProgress.timeRemaining = Math.max(0, (fileSize * (100 - uploadProgress.progress) / 100) / uploadProgress.speed);

      if (uploadProgress.progress >= 100) {
        uploadProgress.progress = 100;
        uploadProgress.stage = 'complete';
        clearInterval(updateInterval);

        // Create the completed file
        const file: FileShare = {
          id: fileId,
          name: fileName,
          size: fileSize,
          type: fileType,
          uploadedBy: users[Math.floor(Math.random() * users.length)],
          uploadedAt: Date.now(),
          roomId: rooms[Math.floor(Math.random() * rooms.length)],
          downloadCount: 0,
          isEncrypted: true,
          status: 'ready',
          progress: 100,
          metadata: this.generateMetadata(fileType, fileSize)
        };

        this.files.set(fileId, file);
        this.uploadProgress.delete(fileId);
        
        this.emit('upload_complete', { file });
        this.emit('file_shared', { file });
      } else {
        this.emit('upload_progress', uploadProgress);
      }
    }, 500); // Update every 500ms
  }

  private simulateFileDownload() {
    const files = Array.from(this.files.values()).filter(f => f.status === 'ready');
    if (files.length === 0) return;

    const file = files[Math.floor(Math.random() * files.length)];
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    const downloadProgress: FileDownloadProgress = {
      fileId: file.id,
      progress: 0,
      stage: 'downloading',
      speed: Math.floor(Math.random() * 2000000) + 200000, // 200KB/s to 2MB/s
      timeRemaining: 0
    };

    this.downloadProgress.set(downloadId, downloadProgress);
    this.emit('download_started', { fileId: file.id, fileName: file.name, downloadId });

    // Simulate download progress
    const updateInterval = setInterval(() => {
      downloadProgress.progress += Math.random() * 20 + 10; // 10-30% per update
      downloadProgress.timeRemaining = Math.max(0, (file.size * (100 - downloadProgress.progress) / 100) / downloadProgress.speed);

      if (downloadProgress.progress >= 100) {
        downloadProgress.progress = 100;
        downloadProgress.stage = 'complete';
        clearInterval(updateInterval);

        // Update download count
        file.downloadCount++;
        
        this.downloadProgress.delete(downloadId);
        this.emit('download_complete', { fileId: file.id, downloadId });
        this.emit('file_downloaded', { file });
      } else {
        this.emit('download_progress', downloadProgress);
      }
    }, 300); // Update every 300ms
  }

  private updateFileExpiration() {
    const now = Date.now();
    let expiredCount = 0;

    this.files.forEach((file) => {
      if (file.expiresAt && file.expiresAt < now && file.status !== 'expired') {
        file.status = 'expired';
        expiredCount++;
        this.emit('file_expired', { file });
      }
    });

    if (expiredCount > 0) {
      this.emit('files_updated', this.getAllFiles());
    }
  }

  // Public API methods
  getAllFiles(): FileShare[] {
    return Array.from(this.files.values())
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  getFilesByRoom(roomId: string): FileShare[] {
    return this.getAllFiles().filter(file => file.roomId === roomId);
  }

  getActiveUploads(): FileUploadProgress[] {
    return Array.from(this.uploadProgress.values());
  }

  getActiveDownloads(): FileDownloadProgress[] {
    return Array.from(this.downloadProgress.values());
  }

  getFile(fileId: string): FileShare | undefined {
    return this.files.get(fileId);
  }

  deleteFile(fileId: string): boolean {
    const file = this.files.get(fileId);
    if (file) {
      file.status = 'deleted';
      this.emit('file_deleted', { file });
      this.emit('files_updated', this.getAllFiles());
      return true;
    }
    return false;
  }

  // File validation
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.formatFileSize(this.maxFileSize)}`
      };
    }

    // Check file type
    const isAllowed = this.allowedTypes.some(allowedType => {
      if (allowedType.endsWith('*')) {
        return file.type.startsWith(allowedType.slice(0, -1));
      }
      if (allowedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(allowedType.toLowerCase());
      }
      return file.type === allowedType;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: 'File type not allowed'
      };
    }

    return { valid: true };
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getStats() {
    const totalFiles = this.files.size;
    const activeFiles = Array.from(this.files.values()).filter(f => f.status === 'ready').length;
    const totalSize = Array.from(this.files.values()).reduce((sum, file) => sum + file.size, 0);
    const totalDownloads = Array.from(this.files.values()).reduce((sum, file) => sum + file.downloadCount, 0);
    const activeUploads = this.uploadProgress.size;
    const activeDownloads = this.downloadProgress.size;

    return {
      totalFiles,
      activeFiles,
      totalSize,
      totalDownloads,
      activeUploads,
      activeDownloads
    };
  }

  // Event system
  on(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in file manager event listener for ${eventType}:`, error);
        }
      });
    }
  }
}

// Singleton instance
let fileManager: RealTimeFileManager | null = null;

export const getFileManager = (): RealTimeFileManager => {
  if (!fileManager) {
    fileManager = new RealTimeFileManager();
  }
  return fileManager;
};

export default RealTimeFileManager;
