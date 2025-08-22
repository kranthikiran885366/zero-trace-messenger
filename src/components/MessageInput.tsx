import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Camera, 
  Image, 
  FileText, 
  MapPin, 
  User, 
  X,
  Pause,
  Play,
  Square,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import EmojiPicker from './EmojiPicker';
import { cn } from '@/lib/utils';

export interface MessageInputProps {
  onSendMessage: (message: {
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
    media?: File;
    location?: { latitude: number; longitude: number; address?: string };
    contact?: { name: string; phone: string; avatar?: string };
    replyTo?: string;
  }) => void;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: {
    id: string;
    content: string;
    username: string;
  };
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 5000,
  className
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  // Handle message sending
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && selectedFiles.length === 0 && !audioBlob) return;

    if (selectedFiles.length > 0) {
      // Send files
      selectedFiles.forEach(file => {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'document';
        
        onSendMessage({
          content: trimmedMessage,
          type: fileType,
          media: file,
          replyTo: replyTo?.id
        });
      });
      setSelectedFiles([]);
    } else if (audioBlob) {
      // Send audio
      const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
      onSendMessage({
        content: '',
        type: 'audio',
        media: audioFile,
        replyTo: replyTo?.id
      });
      setAudioBlob(null);
    } else if (trimmedMessage) {
      // Send text message
      onSendMessage({
        content: trimmedMessage,
        type: 'text',
        replyTo: replyTo?.id
      });
    }

    setMessage('');
    onCancelReply?.();
    
    // Stop typing indicator
    setIsTyping(false);
    onTyping?.(false);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    
    setMessage(newMessage);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files].slice(0, 10)); // Max 10 files
    event.target.value = ''; // Reset input
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get location
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSendMessage({
            content: '',
            type: 'location',
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasContent = message.trim() || selectedFiles.length > 0 || audioBlob;

  return (
    <div className={cn("border-t bg-card p-4", className)}>
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between mb-3 p-2 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">Replying to {replyTo.username}</p>
            <p className="text-sm text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-4 w-4" />
                  ) : file.type.startsWith('video/') ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="text-sm truncate max-w-32">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio recording preview */}
      {audioBlob && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Voice message recorded</p>
              <p className="text-xs text-muted-foreground">{formatTime(recordingTime)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioBlob(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Voice recording indicator */}
      {isRecording && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Recording... {formatTime(recordingTime)}
            </span>
            <div className="flex-1">
              <Progress value={(recordingTime % 60) * (100 / 60)} className="h-1" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelRecording}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="flex items-end gap-2">
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              disabled={disabled || isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <Image className="mr-2 h-4 w-4" />
              Photos & Videos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLocationShare}>
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text input area */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            maxLength={maxLength}
            className="min-h-10 max-h-32 resize-none pr-10 py-2"
            rows={1}
          />
          
          {/* Character count */}
          {maxLength && message.length > maxLength * 0.8 && (
            <Badge 
              variant={message.length >= maxLength ? "destructive" : "secondary"}
              className="absolute bottom-1 right-1 text-xs"
            >
              {message.length}/{maxLength}
            </Badge>
          )}
        </div>

        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              disabled={disabled || isRecording}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-0">
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </PopoverContent>
        </Popover>

        {/* Voice/Send button */}
        {hasContent ? (
          <Button
            onClick={handleSendMessage}
            disabled={disabled}
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            disabled={disabled}
            variant={isRecording ? "destructive" : "ghost"}
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt"
      />
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept="image/*,video/*"
      />
    </div>
  );
};

export default MessageInput;
