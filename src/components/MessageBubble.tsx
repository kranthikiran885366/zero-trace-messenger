import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Reply, 
  Forward, 
  Copy, 
  Trash2, 
  Edit, 
  Heart, 
  ThumbsUp, 
  Smile, 
  CheckCheck, 
  Check,
  Volume2,
  Download,
  Star,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  avatar?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  isOwn: boolean;
  isRead: boolean;
  isDelivered: boolean;
  isSending?: boolean;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    content: string;
    username: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  media?: {
    url: string;
    thumbnail?: string;
    duration?: number;
    size?: number;
    filename?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  isForwarded?: boolean;
  forwardedFrom?: string;
  isStarred?: boolean;
  disappearIn?: number; // seconds until message disappears
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showTime?: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onDownload?: (messageId: string) => void;
  className?: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true,
  showTime = true,
  onReply,
  onForward,
  onReact,
  onEdit,
  onDelete,
  onStar,
  onDownload,
  className
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const messageRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowReactions(false);
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const renderMedia = () => {
    if (!message.media) return null;

    switch (message.type) {
      case 'image':
        return (
          <div className="relative max-w-xs rounded-lg overflow-hidden">
            <img 
              src={message.media.url} 
              alt="Shared image"
              className="w-full h-auto object-cover"
            />
            {onDownload && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onDownload(message.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative max-w-xs rounded-lg overflow-hidden">
            <video 
              src={message.media.url}
              poster={message.media.thumbnail}
              controls
              className="w-full h-auto"
            />
            {message.media.duration && (
              <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                {Math.floor(message.media.duration / 60)}:{(message.media.duration % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg max-w-xs">
            <Volume2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <audio src={message.media.url} controls className="w-full" />
            </div>
            {message.media.duration && (
              <span className="text-xs text-muted-foreground">
                {Math.floor(message.media.duration / 60)}:{(message.media.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg max-w-xs">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Copy className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.media.filename}</p>
              {message.media.size && (
                <p className="text-xs text-muted-foreground">
                  {(message.media.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            {onDownload && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDownload(message.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderLocation = () => {
    if (!message.location) return null;

    return (
      <div className="bg-muted p-3 rounded-lg max-w-xs">
        <div className="aspect-video bg-primary/10 rounded-lg mb-2 flex items-center justify-center">
          <span className="text-2xl">📍</span>
        </div>
        <p className="font-medium text-sm">Location</p>
        {message.location.address && (
          <p className="text-xs text-muted-foreground">{message.location.address}</p>
        )}
      </div>
    );
  };

  const renderContact = () => {
    if (!message.contact) return null;

    return (
      <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg max-w-xs">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.contact.avatar} />
          <AvatarFallback>{message.contact.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{message.contact.name}</p>
          <p className="text-xs text-muted-foreground">{message.contact.phone}</p>
        </div>
        <Button size="sm" variant="outline">
          Add
        </Button>
      </div>
    );
  };

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex gap-2 mb-4 group relative",
        message.isOwn ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && !message.isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.avatar} />
          <AvatarFallback className="text-xs">
            {message.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col max-w-[70%]",
        message.isOwn ? "items-end" : "items-start"
      )}>
        {/* Forwarded indicator */}
        {message.isForwarded && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Forward className="h-3 w-3" />
            Forwarded from {message.forwardedFrom}
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={cn(
            "bg-muted/50 border-l-4 border-primary p-2 rounded-lg mb-1 text-xs max-w-full",
            message.isOwn ? "bg-primary/10" : "bg-muted/50"
          )}>
            <p className="font-medium text-primary">{message.replyTo.username}</p>
            <p className="text-muted-foreground truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message bubble */}
        <div 
          className={cn(
            "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200",
            message.isOwn 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-card border rounded-bl-md",
            message.isSending && "opacity-70",
            "hover:shadow-md"
          )}
        >
          {/* Username for group chats */}
          {!message.isOwn && showAvatar && (
            <p className="text-xs font-medium text-primary mb-1">
              {message.username}
            </p>
          )}

          {/* Message content */}
          <div className="space-y-2">
            {/* Media content */}
            {renderMedia()}
            {renderLocation()}
            {renderContact()}

            {/* Text content */}
            {message.content && (
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm bg-transparent border rounded resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Message metadata */}
          <div className={cn(
            "flex items-center justify-end gap-1 mt-2 text-xs",
            message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {message.isEdited && <span>(edited)</span>}
            {message.isStarred && <Star className="h-3 w-3 fill-current" />}
            {showTime && <span>{formatTime(message.timestamp)}</span>}
            {message.isOwn && (
              <div className="flex">
                {message.isSending ? (
                  <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : message.isRead ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : message.isDelivered ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>

          {/* Disappearing message timer */}
          {message.disappearIn && (
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="text-xs px-1">
                {message.disappearIn}s
              </Badge>
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs rounded-full"
                onClick={() => handleReaction(reaction.emoji)}
              >
                {reaction.emoji} {reaction.users.length}
              </Button>
            ))}
          </div>
        )}

        {/* Quick reactions overlay */}
        {showReactions && (
          <div className={cn(
            "absolute -top-12 bg-card border rounded-full p-1 shadow-lg z-10",
            message.isOwn ? "right-0" : "left-0"
          )}>
            <div className="flex gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message actions menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={message.isOwn ? "end" : "start"}>
            <DropdownMenuItem onClick={() => setShowReactions(!showReactions)}>
              <Smile className="mr-2 h-4 w-4" />
              React
            </DropdownMenuItem>
            
            {onReply && (
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
            )}
            
            {onForward && (
              <DropdownMenuItem onClick={() => onForward(message)}>
                <Forward className="mr-2 h-4 w-4" />
                Forward
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>
            
            {onStar && (
              <DropdownMenuItem onClick={() => onStar(message.id)}>
                <Star className="mr-2 h-4 w-4" />
                {message.isStarred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Info className="mr-2 h-4 w-4" />
              Message Info
            </DropdownMenuItem>
            
            {message.isOwn && onEdit && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            
            {(message.isOwn || message.type !== 'text') && onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(message.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MessageBubble;
