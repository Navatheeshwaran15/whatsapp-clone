import React, { useState, useRef, useCallback } from 'react';
import { useSendMessage, useSendImageMessage } from '../hooks/useQueries';
import { Send, Smile, ImagePlus } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ImagePreview from './ImagePreview';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: (content: string, imageFile?: File) => void;
}

export default function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number>(0);

  const sendMessage = useSendMessage(conversationId);
  const sendImageMessage = useSendImageMessage(conversationId);

  const isPending = sendMessage.isPending || sendImageMessage.isPending;

  const handleSend = async () => {
    const trimmed = message.trim();
    if ((!trimmed && !selectedImage) || isPending) return;

    if (selectedImage) {
      // Send image message
      const imageFile = selectedImage;
      const content = trimmed;
      setMessage('');
      clearImage();
      try {
        await sendImageMessage.mutateAsync({ content, imageFile });
        onMessageSent?.(content, imageFile);
      } catch {
        setMessage(content);
      }
    } else {
      // Send text-only message
      setMessage('');
      try {
        await sendMessage.mutateAsync(trimmed);
        onMessageSent?.(trimmed);
      } catch {
        setMessage(trimmed);
      }
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const pos = cursorPosRef.current;
      const newMessage = message.slice(0, pos) + emoji + message.slice(pos);
      setMessage(newMessage);
      // Restore cursor after emoji insertion
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = pos + emoji.length;
          inputRef.current.setSelectionRange(newPos, newPos);
          inputRef.current.focus();
          cursorPosRef.current = newPos;
        }
      }, 0);
    },
    [message]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    cursorPosRef.current = e.target.selectionStart ?? e.target.value.length;
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    cursorPosRef.current = (e.target as HTMLInputElement).selectionStart ?? message.length;
  };

  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    cursorPosRef.current = (e.target as HTMLInputElement).selectionStart ?? message.length;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    const url = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(url);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const clearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const canSend = (message.trim().length > 0 || !!selectedImage) && !isPending;

  return (
    <div className="bg-sidebar-header shrink-0">
      {/* Image preview strip */}
      {selectedImage && imagePreviewUrl && (
        <ImagePreview
          file={selectedImage}
          previewUrl={imagePreviewUrl}
          onClear={clearImage}
        />
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="relative px-4">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Input row */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Emoji toggle */}
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            showEmojiPicker
              ? 'bg-chat-sent/20 text-chat-sent'
              : 'hover:bg-sidebar-hover text-sidebar-muted'
          }`}
          title="Emoji"
          type="button"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Image attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            selectedImage
              ? 'bg-chat-sent/20 text-chat-sent'
              : 'hover:bg-sidebar-hover text-sidebar-muted'
          }`}
          title="Attach image"
          type="button"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyUp={handleInputKeyUp}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? 'Add a caption…' : 'Type a message'}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl bg-sidebar-hover text-sidebar-text placeholder:text-sidebar-muted text-sm focus:outline-none focus:ring-1 focus:ring-chat-sent disabled:opacity-60"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-full bg-chat-sent text-chat-sent-text hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Send message"
          type="button"
        >
          {isPending ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
