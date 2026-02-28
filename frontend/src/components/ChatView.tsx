import React, { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import UserAvatar from './UserAvatar';
import ImageModal from './ImageModal';
import type { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';
import { MessageCircle } from 'lucide-react';

export interface LocalMessage {
  id: string;
  sender: string; // principal string
  content: string;
  timestamp: bigint;
  imageUrl?: string; // base64 data URL or blob URL for image messages
}

interface ChatViewProps {
  conversationId: string | null;
  recipientPrincipal: Principal | null;
  recipientProfile: UserProfile | null;
  messages: LocalMessage[];
  currentUserProfile: UserProfile | null;
}

function formatTime(timestamp: bigint): string {
  // timestamp is in nanoseconds
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChatView({
  conversationId,
  recipientPrincipal,
  recipientProfile,
  messages,
  currentUserProfile,
}: ChatViewProps) {
  const { identity } = useInternetIdentity();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentPrincipal = identity?.getPrincipal().toString();
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversationId || !recipientPrincipal || !recipientProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-sidebar-dark flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-chat-sent" />
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-xl">ChatFlow</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Select a contact from the left to start a conversation
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-online inline-block" />
            End-to-end encrypted
          </div>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: LocalMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = formatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div className="flex-1 flex flex-col bg-chat-bg overflow-hidden">
      <ChatHeader
        recipientPrincipal={recipientPrincipal}
        recipientProfile={recipientProfile}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white/80 rounded-2xl px-6 py-4 shadow-xs max-w-xs">
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hi to{' '}
                <span className="font-medium text-foreground">{recipientProfile.username}</span>!
              </p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="bg-white/80 text-muted-foreground text-xs px-3 py-1 rounded-full shadow-xs">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-1">
                {group.messages.map((msg) => {
                  const isSent = msg.sender === currentPrincipal;
                  const hasImage = !!msg.imageUrl;
                  const hasText = msg.content.trim().length > 0;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 animate-fade-in ${
                        isSent ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {!isSent && (
                        <UserAvatar
                          username={recipientProfile.username}
                          size="xs"
                          className="mb-1 shrink-0"
                        />
                      )}

                      <div
                        className={`max-w-[65%] rounded-2xl shadow-chat overflow-hidden ${
                          isSent
                            ? 'bg-chat-sent text-chat-sent-text rounded-br-sm'
                            : 'bg-chat-received text-chat-received-text rounded-bl-sm'
                        }`}
                      >
                        {/* Image bubble */}
                        {hasImage && (
                          <div
                            className="cursor-pointer relative group"
                            onClick={() => setModalImageSrc(msg.imageUrl!)}
                          >
                            <img
                              src={msg.imageUrl}
                              alt="Shared image"
                              className="max-w-full max-h-72 object-cover block"
                              style={{ minWidth: '120px' }}
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/40 px-2 py-1 rounded-full">
                                View
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Text content (caption or message) */}
                        {(hasText || !hasImage) && (
                          <div className={`px-3 py-2 ${hasImage ? 'pt-1.5' : ''}`}>
                            {hasText && (
                              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            )}
                            <p
                              className={`text-[10px] mt-1 text-right ${
                                isSent ? 'text-white/70' : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        )}

                        {/* Timestamp for image-only messages */}
                        {hasImage && !hasText && (
                          <div className="px-3 pb-1.5">
                            <p
                              className={`text-[10px] text-right ${
                                isSent ? 'text-white/70' : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput conversationId={conversationId} />

      {/* Full-size image modal */}
      {modalImageSrc && (
        <ImageModal
          src={modalImageSrc}
          alt="Shared image"
          onClose={() => setModalImageSrc(null)}
        />
      )}
    </div>
  );
}
