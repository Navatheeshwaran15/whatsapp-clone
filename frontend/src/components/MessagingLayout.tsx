import React, { useState, useCallback } from 'react';
import ContactsList from './ContactsList';
import ChatView, { type LocalMessage } from './ChatView';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';

interface ActiveConversation {
  conversationId: string;
  principal: Principal;
  profile: UserProfile;
}

interface MessagingLayoutProps {
  currentUserProfile: UserProfile;
}

export default function MessagingLayout({ currentUserProfile }: MessagingLayoutProps) {
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [messages] = useState<LocalMessage[]>([]);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSelectConversation = useCallback(
    (conversationId: string, principal: Principal, profile: UserProfile) => {
      setActiveConversation({ conversationId, principal, profile });
    },
    []
  );

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar-dark">
      {/* Sidebar */}
      <div className="w-80 shrink-0 flex flex-col border-r border-sidebar-hover">
        <ContactsList
          activeConversationId={activeConversation?.conversationId ?? null}
          onSelectConversation={handleSelectConversation}
          currentUserProfile={currentUserProfile}
        />

        {/* Footer with logout */}
        <div className="bg-sidebar-header px-4 py-2.5 flex items-center justify-between shrink-0 border-t border-sidebar-hover">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-online shrink-0" />
            <span className="text-sidebar-muted text-xs truncate">{currentUserProfile.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full hover:bg-sidebar-hover text-sidebar-muted transition-colors shrink-0"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatView
          conversationId={activeConversation?.conversationId ?? null}
          recipientPrincipal={activeConversation?.principal ?? null}
          recipientProfile={activeConversation?.profile ?? null}
          messages={messages}
          currentUserProfile={currentUserProfile}
        />
      </div>
    </div>
  );
}
