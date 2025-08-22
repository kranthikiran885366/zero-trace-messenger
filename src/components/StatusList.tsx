import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Camera, 
  Type, 
  MoreVertical, 
  Eye, 
  Reply, 
  Share, 
  Download,
  Trash2,
  Edit,
  Settings,
  Users,
  Clock,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface StatusItem {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  timestamp: Date;
  expiresAt: Date;
  type: 'text' | 'image' | 'video';
  content: string;
  media?: {
    url: string;
    thumbnail?: string;
  };
  backgroundColor?: string;
  textColor?: string;
  font?: string;
  views: {
    userId: string;
    username: string;
    timestamp: Date;
  }[];
  replies: {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
  }[];
  isViewedByUser: boolean;
  privacy: 'public' | 'contacts' | 'close_friends' | 'except';
}

export interface StatusContact {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  statuses: StatusItem[];
  hasUnviewedStatus: boolean;
  lastStatusAt?: Date;
}

interface StatusListProps {
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  userStatus: StatusItem[];
  contacts: StatusContact[];
  onCreateStatus: (status: { type: 'text' | 'image' | 'video'; content: string; media?: File; backgroundColor?: string }) => void;
  onViewStatus: (statusId: string) => void;
  onDeleteStatus: (statusId: string) => void;
  onReplyToStatus: (statusId: string, reply: string) => void;
  className?: string;
}

const STATUS_BACKGROUNDS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#EE5A24', '#0ABDE3', '#10AC84', '#222F3E', '#C44569'
];

export const StatusList: React.FC<StatusListProps> = ({
  currentUser,
  userStatus,
  contacts,
  onCreateStatus,
  onViewStatus,
  onDeleteStatus,
  onReplyToStatus,
  className
}) => {
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedBackground, setSelectedBackground] = useState(STATUS_BACKGROUNDS[0]);
  const [isCreatingTextStatus, setIsCreatingTextStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Recent contacts with unviewed statuses
  const recentStatuses = contacts.filter(contact => 
    contact.statuses.length > 0 && 
    contact.statuses.some(status => new Date(status.expiresAt) > new Date())
  );

  // Contacts with viewed statuses
  const viewedStatuses = recentStatuses.filter(contact => 
    !contact.hasUnviewedStatus
  );

  // Contacts with unviewed statuses
  const unviewedStatuses = recentStatuses.filter(contact => 
    contact.hasUnviewedStatus
  );

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      onCreateStatus({
        type,
        content: '',
        media: file
      });
    }
    event.target.value = '';
  };

  // Handle text status creation
  const handleCreateTextStatus = () => {
    if (statusText.trim()) {
      onCreateStatus({
        type: 'text',
        content: statusText.trim(),
        backgroundColor: selectedBackground
      });
      setStatusText('');
      setIsCreatingTextStatus(false);
      setShowCreateStatus(false);
    }
  };

  // Get status ring color
  const getStatusRingColor = (contact: StatusContact) => {
    if (contact.hasUnviewedStatus) {
      return 'ring-2 ring-primary ring-offset-2';
    }
    return 'ring-2 ring-muted ring-offset-2';
  };

  return (
    <div className={cn("bg-card", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Status</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Status Privacy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Close Friends
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User's status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className={cn("h-14 w-14", userStatus.length > 0 && getStatusRingColor({ 
              id: currentUser.id, 
              username: currentUser.username, 
              statuses: userStatus, 
              hasUnviewedStatus: false 
            } as StatusContact))}>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {currentUser.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => setShowCreateStatus(true)}
              size="sm"
              className="absolute -bottom-1 -right-1 h-6 w-6 p-0 rounded-full"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex-1">
            <p className="font-medium">My status</p>
            <p className="text-sm text-muted-foreground">
              {userStatus.length > 0 
                ? `${formatTime(userStatus[userStatus.length - 1].timestamp)} ago`
                : 'Tap to add status update'
              }
            </p>
          </div>

          {userStatus.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {userStatus.reduce((total, status) => total + status.views.length, 0)}
            </div>
          )}
        </div>
      </div>

      {/* Create status dialog */}
      <Dialog open={showCreateStatus} onOpenChange={setShowCreateStatus}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create Status</h3>
            
            {isCreatingTextStatus ? (
              <div className="space-y-4">
                <div 
                  className="relative p-6 rounded-lg min-h-32 flex items-center justify-center"
                  style={{ backgroundColor: selectedBackground }}
                >
                  <Textarea
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    placeholder="Type your status..."
                    className="bg-transparent border-none text-white placeholder:text-white/70 text-center resize-none text-lg"
                    maxLength={700}
                    rows={3}
                  />
                </div>
                
                {/* Background colors */}
                <div className="flex gap-2 justify-center">
                  {STATUS_BACKGROUNDS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedBackground(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        selectedBackground === color ? "border-foreground" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateTextStatus} className="flex-1">
                    Share Status
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingTextStatus(false)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setIsCreatingTextStatus(true)}
                  variant="outline"
                  className="flex items-center gap-3 h-12"
                >
                  <Type className="h-5 w-5" />
                  Text Status
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-3 h-12"
                >
                  <Camera className="h-5 w-5" />
                  Photo/Video from Gallery
                </Button>
                
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-3 h-12"
                >
                  <Camera className="h-5 w-5" />
                  Take Photo/Video
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status list */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Recent updates */}
          {unviewedStatuses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                Recent updates
              </h3>
              <div className="space-y-3">
                {unviewedStatuses.map((contact) => (
                  <StatusContactItem
                    key={contact.id}
                    contact={contact}
                    onViewStatus={onViewStatus}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Viewed updates */}
          {viewedStatuses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                Viewed updates
              </h3>
              <div className="space-y-3">
                {viewedStatuses.map((contact) => (
                  <StatusContactItem
                    key={contact.id}
                    contact={contact}
                    onViewStatus={onViewStatus}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {recentStatuses.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No status updates</p>
              <p className="text-sm text-muted-foreground">
                Status updates from your contacts will appear here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*"
      />
      <input
        ref={cameraInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*"
        capture="environment"
      />
    </div>
  );
};

// Status contact item component
interface StatusContactItemProps {
  contact: StatusContact;
  onViewStatus: (statusId: string) => void;
  formatTime: (date: Date) => string;
}

const StatusContactItem: React.FC<StatusContactItemProps> = ({
  contact,
  onViewStatus,
  formatTime
}) => {
  const latestStatus = contact.statuses[contact.statuses.length - 1];
  
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onViewStatus(latestStatus.id)}
    >
      <Avatar className={cn("h-12 w-12", getStatusRingColor(contact))}>
        <AvatarImage src={contact.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {contact.username[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{contact.username}</p>
        <p className="text-sm text-muted-foreground">
          {formatTime(latestStatus.timestamp)}
        </p>
      </div>
      
      <div className="flex items-center gap-1">
        {contact.statuses.length > 1 && (
          <Badge variant="secondary" className="text-xs">
            {contact.statuses.length}
          </Badge>
        )}
        {contact.hasUnviewedStatus && (
          <div className="w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
    </div>
  );
};

// Helper function for status ring color
const getStatusRingColor = (contact: StatusContact) => {
  if (contact.hasUnviewedStatus) {
    return 'ring-2 ring-primary ring-offset-2';
  }
  return 'ring-2 ring-muted ring-offset-2';
};

export default StatusList;
