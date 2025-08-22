import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MoreVertical, 
  Send, 
  Heart, 
  MessageCircle, 
  Share, 
  Download,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Eye,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { StatusItem, StatusContact } from './StatusList';

interface StatusViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: StatusContact[];
  currentContactIndex: number;
  currentStatusIndex: number;
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  onNext: () => void;
  onPrevious: () => void;
  onReply: (statusId: string, reply: string) => void;
  onMarkAsViewed: (statusId: string) => void;
  onDeleteStatus?: (statusId: string) => void;
  className?: string;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  isOpen,
  onClose,
  contacts,
  currentContactIndex,
  currentStatusIndex,
  currentUser,
  onNext,
  onPrevious,
  onReply,
  onMarkAsViewed,
  onDeleteStatus,
  className
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentContact = contacts[currentContactIndex];
  const currentStatus = currentContact?.statuses[currentStatusIndex];
  
  const STORY_DURATION = 5000; // 5 seconds for images/text
  const LONG_PRESS_DURATION = 500;

  // Auto-advance progress
  useEffect(() => {
    if (!isOpen || !currentStatus || isPaused) return;

    const duration = currentStatus.type === 'video' ? 
      (videoRef.current?.duration || STORY_DURATION / 1000) * 1000 : 
      STORY_DURATION;

    setProgress(0);
    
    const interval = 50; // Update every 50ms for smooth progress
    const increment = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, currentStatus, isPaused, onNext]);

  // Mark status as viewed
  useEffect(() => {
    if (currentStatus && !currentStatus.isViewedByUser) {
      onMarkAsViewed(currentStatus.id);
    }
  }, [currentStatus, onMarkAsViewed]);

  // Pause/resume on space key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNext, onPrevious, onClose]);

  // Handle video play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isPaused]);

  if (!isOpen || !currentContact || !currentStatus) return null;

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(currentStatus.id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
  };

  const handlePressEnd = () => {
    setIsPaused(false);
  };

  const isOwnStatus = currentStatus.userId === currentUser.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className={cn("relative h-[600px] bg-black text-white", className)}>
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-50 flex gap-1">
            {currentContact.statuses.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-75"
                  style={{ 
                    width: index < currentStatusIndex ? '100%' : 
                           index === currentStatusIndex ? `${progress}%` : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentContact.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {currentContact.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{currentContact.username}</p>
                <p className="text-xs text-white/70">
                  {new Date(currentStatus.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOwnStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewers(true)}
                  className="text-white hover:bg-white/20 h-8 px-2"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {currentStatus.views.length}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {!isOwnStatus && (
                    <DropdownMenuItem onClick={() => setShowReplyInput(true)}>
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  {currentStatus.type !== 'text' && (
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  )}
                  {isOwnStatus && onDeleteStatus && (
                    <DropdownMenuItem onClick={() => onDeleteStatus(currentStatus.id)}>
                      <X className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation areas */}
          <div className="absolute inset-0 z-40 flex">
            <div 
              className="flex-1 cursor-pointer"
              onClick={onPrevious}
              onMouseDown={handleLongPress}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handleLongPress}
              onTouchEnd={handlePressEnd}
            />
            <div 
              className="flex-1 cursor-pointer"
              onClick={onNext}
              onMouseDown={handleLongPress}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handleLongPress}
              onTouchEnd={handlePressEnd}
            />
          </div>

          {/* Status content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {currentStatus.type === 'text' ? (
              <div 
                className="p-8 rounded-lg text-center max-w-xs"
                style={{ 
                  backgroundColor: currentStatus.backgroundColor,
                  color: currentStatus.textColor || 'white' 
                }}
              >
                <p className="text-lg font-medium leading-relaxed">
                  {currentStatus.content}
                </p>
              </div>
            ) : currentStatus.type === 'image' ? (
              <img
                src={currentStatus.media?.url}
                alt="Status"
                className="max-w-full max-h-full object-contain"
              />
            ) : currentStatus.type === 'video' ? (
              <div className="relative max-w-full max-h-full">
                <video
                  ref={videoRef}
                  src={currentStatus.media?.url}
                  className="max-w-full max-h-full object-contain"
                  muted={isMuted}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                      setProgress(percent);
                    }
                  }}
                  onEnded={onNext}
                />
                
                {/* Video controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Navigation arrows */}
          {currentStatusIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 p-0 z-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          {currentStatusIndex < currentContact.statuses.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 p-0 z-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}

          {/* Reply input */}
          {showReplyInput && !isOwnStatus && (
            <div className="absolute bottom-4 left-4 right-4 z-50">
              <div className="flex gap-2 bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to this status..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleReply();
                    } else if (e.key === 'Escape') {
                      setShowReplyInput(false);
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Bottom action for non-owners */}
          {!isOwnStatus && !showReplyInput && (
            <div className="absolute bottom-4 left-4 right-4 z-50">
              <Button
                onClick={() => setShowReplyInput(true)}
                variant="ghost"
                className="w-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Reply to {currentContact.username}
              </Button>
            </div>
          )}

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
              <div className="bg-black/50 rounded-full p-4">
                <Pause className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Viewers dialog */}
        {showViewers && isOwnStatus && (
          <Dialog open={showViewers} onOpenChange={setShowViewers}>
            <DialogContent className="sm:max-w-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Viewed by {currentStatus.views.length}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowViewers(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {currentStatus.views.map((view) => (
                      <div key={view.userId} className="flex items-center gap-3 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {view.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{view.username}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(view.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusViewer;
