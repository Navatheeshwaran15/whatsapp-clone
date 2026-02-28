import React from 'react';
import { useIsUserOnline } from '../hooks/useQueries';
import UserAvatar from './UserAvatar';
import StatusIndicator from './StatusIndicator';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';
import { Search, Phone, Video, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  recipientPrincipal: Principal;
  recipientProfile: UserProfile;
}

export default function ChatHeader({ recipientPrincipal, recipientProfile }: ChatHeaderProps) {
  const { data: isOnline = false } = useIsUserOnline(recipientPrincipal);

  return (
    <div className="sticky top-0 z-10 bg-chat-header flex items-center justify-between px-4 py-3 shrink-0 shadow-chat">
      <div className="flex items-center gap-3">
        <div className="relative">
          <UserAvatar username={recipientProfile.username} size="sm" />
          <span className="absolute -bottom-0.5 -right-0.5">
            <StatusIndicator isOnline={isOnline} size="sm" />
          </span>
        </div>
        <div>
          <h2 className="text-sidebar-text font-semibold text-sm leading-tight">
            {recipientProfile.username}
          </h2>
          <p className="text-xs text-sidebar-muted leading-tight">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors" title="Search">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors" title="Voice call (coming soon)">
          <Phone className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors" title="Video call (coming soon)">
          <Video className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors" title="More options">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
