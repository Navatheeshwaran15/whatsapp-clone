import React from 'react';
import { useGetAllUserProfiles, useIsUserOnline, getConversationId } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import UserAvatar from './UserAvatar';
import StatusIndicator from './StatusIndicator';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';
import { Search, MoreVertical } from 'lucide-react';

interface ContactItemProps {
  principal: Principal;
  profile: UserProfile;
  isActive: boolean;
  onClick: () => void;
}

function ContactItem({ principal, profile, isActive, onClick }: ContactItemProps) {
  const { data: isOnline = false } = useIsUserOnline(principal);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
        isActive
          ? 'bg-sidebar-active'
          : 'hover:bg-sidebar-hover'
      }`}
    >
      <div className="relative shrink-0">
        <UserAvatar username={profile.username} size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusIndicator isOnline={isOnline} size="sm" />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sidebar-text font-medium text-sm truncate">
            {profile.username}
          </span>
        </div>
        <p className="text-sidebar-muted text-xs truncate mt-0.5">
          {profile.status || 'Hey there! I am using ChatFlow.'}
        </p>
      </div>
    </button>
  );
}

interface ContactsListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string, principal: Principal, profile: UserProfile) => void;
  currentUserProfile: UserProfile | null;
}

export default function ContactsList({
  activeConversationId,
  onSelectConversation,
  currentUserProfile,
}: ContactsListProps) {
  const { identity } = useInternetIdentity();
  const { data: allProfiles = [], isLoading } = useGetAllUserProfiles();
  const [search, setSearch] = React.useState('');

  const currentPrincipal = identity?.getPrincipal().toString();

  // Filter out current user and apply search
  const contacts = allProfiles.filter(([principal, profile]) => {
    if (principal.toString() === currentPrincipal) return false;
    if (!search.trim()) return true;
    return profile.username.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-sidebar-dark">
      {/* Header */}
      <div className="bg-sidebar-header px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/chatflow-logo.dim_256x256.png"
            alt="ChatFlow"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-sidebar-text font-semibold text-base">ChatFlow</span>
        </div>
        <div className="flex items-center gap-1">
          {currentUserProfile && (
            <div className="flex items-center gap-2">
              <UserAvatar username={currentUserProfile.username} size="xs" />
            </div>
          )}
          <button className="p-2 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-sidebar-hover text-sidebar-text placeholder:text-sidebar-muted text-xs focus:outline-none focus:ring-1 focus:ring-chat-sent"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-sidebar-hover animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-sidebar-hover rounded animate-pulse w-2/3" />
                  <div className="h-2.5 bg-sidebar-hover rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-sidebar-muted text-sm px-4 text-center">
            {search ? (
              <p>No contacts found for "{search}"</p>
            ) : (
              <p>No other users yet. Share the app link to invite friends!</p>
            )}
          </div>
        ) : (
          <div>
            {contacts.map(([principal, profile]) => {
              const convId = currentPrincipal
                ? getConversationId(currentPrincipal, principal.toString())
                : '';
              return (
                <ContactItem
                  key={principal.toString()}
                  principal={principal}
                  profile={profile}
                  isActive={activeConversationId === convId}
                  onClick={() => onSelectConversation(convId, principal, profile)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
