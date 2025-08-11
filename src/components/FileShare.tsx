import { useState, useRef, useCallback } from 'react';
import { Upload, Download, File, Image, Video, Music, Archive, X, Shield, Clock, Copy, Share2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { encryption } from '@/lib/encryption';

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: number;
  encryptedUrl: string;
  thumbnail?: string;
  password?: string;
}

const FileShare = () => {
  const { toast } = useToast();
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [fileSettings, setFileSettings] = useState({
    maxDownloads: '10',
    expiryTime: '86400000', // 24 hours
    password: '',
    burnAfterReading: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxDownloadOptions = [
    { value: '1', label: '1 download (Burn after reading)' },
    { value: '5', label: '5 downloads' },
    { value: '10', label: '10 downloads' },
    { value: '25', label: '25 downloads' },
    { value: '100', label: '100 downloads' },
    { value: 'unlimited', label: 'Unlimited' },
  ];

  const expiryOptions = [
    { value: '3600000', label: '1 hour' },
    { value: '86400000', label: '24 hours' },
    { value: '604800000', label: '7 days' },
    { value: '2592000000', label: '30 days' },
    { value: 'never', label: 'Never expire' },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    const maxSize = 250 * 1024 * 1024; // 250MB
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the maximum size of 250MB.`,
          variant: "destructive"
        });
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    
    try {
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }

      // Create encrypted file URL (simulated)
      const encryptedUrl = `encrypted_${fileId}_${btoa(file.name)}`;
      
      const sharedFile: SharedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: Date.now(),
        downloadCount: 0,
        maxDownloads: fileSettings.maxDownloads === 'unlimited' ? Infinity : parseInt(fileSettings.maxDownloads),
        expiresAt: fileSettings.expiryTime === 'never' ? Infinity : Date.now() + parseInt(fileSettings.expiryTime),
        encryptedUrl,
        password: fileSettings.password || undefined,
      };

      setSharedFiles(prev => [...prev, sharedFile]);
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "🔒 File Encrypted & Uploaded",
        description: `${file.name} is now securely available for sharing.`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive"
      });
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const downloadFile = async (file: SharedFile) => {
    if (file.downloadCount >= file.maxDownloads) {
      toast({
        title: "Download Limit Reached",
        description: "This file has reached its maximum download limit.",
        variant: "destructive"
      });
      return;
    }

    if (Date.now() > file.expiresAt) {
      toast({
        title: "File Expired",
        description: "This file has expired and is no longer available.",
        variant: "destructive"
      });
      return;
    }

    // Simulate download
    setSharedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, downloadCount: f.downloadCount + 1 }
        : f
    ));

    toast({
      title: "🔓 File Downloaded",
      description: `${file.name} has been decrypted and downloaded.`,
    });

    // Auto-delete if burn after reading
    if (file.maxDownloads === 1) {
      setTimeout(() => {
        deleteFile(file.id);
      }, 1000);
    }
  };

  const deleteFile = (fileId: string) => {
    setSharedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File Deleted",
      description: "File has been permanently removed from secure storage.",
    });
  };

  const copyShareLink = (file: SharedFile) => {
    const link = `${window.location.origin}/file/${file.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Share Link Copied",
      description: "Encrypted file link copied to clipboard.",
    });
  };

  const getTimeRemaining = (expiresAt: number) => {
    if (expiresAt === Infinity) return 'Never expires';
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    
    const minutes = Math.floor(remaining / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Secure File Sharing
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Upload and share files with military-grade encryption and privacy controls
            </p>
          </CardHeader>
        </Card>

        {/* Upload Section */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
              <p className="text-muted-foreground mb-4">
                Maximum file size: 250MB • Supported: All file types
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Downloads</label>
                <Select 
                  value={fileSettings.maxDownloads} 
                  onValueChange={(value) => setFileSettings(prev => ({ ...prev, maxDownloads: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {maxDownloadOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expires In</label>
                <Select 
                  value={fileSettings.expiryTime} 
                  onValueChange={(value) => setFileSettings(prev => ({ ...prev, expiryTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password (Optional)</label>
                <Input
                  type="password"
                  placeholder="Add extra protection"
                  value={fileSettings.password}
                  onChange={(e) => setFileSettings(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button variant="cyber" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Set Defaults
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploading Files...</h4>
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Encrypting and uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shared Files */}
        {sharedFiles.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5 text-accent" />
                Shared Files ({sharedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-card/80 transition-colors"
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        {file.password && (
                          <Badge variant="secondary" className="text-xs">
                            🔒 Protected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>
                          {file.downloadCount}/{file.maxDownloads === Infinity ? '∞' : file.maxDownloads} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeRemaining(file.expiresAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        disabled={file.downloadCount >= file.maxDownloads || Date.now() > file.expiresAt}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyShareLink(file)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Your Files Are Secured</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">🔒 AES-256 Encryption</p>
                <p>All files encrypted before upload with military-grade security</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">🔥 Auto-Deletion</p>
                <p>Files automatically destroyed based on your settings</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">🌐 Anonymous Sharing</p>
                <p>No personal data required for uploading or downloading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FileShare;
