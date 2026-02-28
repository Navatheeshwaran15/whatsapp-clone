import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { emojiCategories, allEmojis, type EmojiItem } from '../utils/emojiData';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0].id);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredEmojis: EmojiItem[] = search.trim()
    ? allEmojis.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-2 left-0 w-80 rounded-2xl shadow-2xl border border-sidebar-hover overflow-hidden z-50"
      style={{ background: 'oklch(0.18 0.01 240)' }}
    >
      {/* Search bar */}
      <div className="p-3 border-b border-sidebar-hover">
        <div className="flex items-center gap-2 bg-sidebar-hover rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-sidebar-muted shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="flex-1 bg-transparent text-sidebar-text text-xs placeholder:text-sidebar-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search.trim() && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-sidebar-hover overflow-x-auto scrollbar-hide">
          {emojiCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.label}
              className={`p-1.5 rounded-lg text-base transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-chat-sent/20 text-chat-sent'
                  : 'hover:bg-sidebar-hover text-sidebar-muted'
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="h-52 overflow-y-auto p-2">
        {search.trim() ? (
          filteredEmojis.length > 0 ? (
            <div className="grid grid-cols-8 gap-0.5">
              {filteredEmojis.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item.emoji)}
                  title={item.name}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-sidebar-hover transition-colors"
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sidebar-muted text-xs">
              No emojis found
            </div>
          )
        ) : (
          emojiCategories
            .filter((cat) => cat.id === activeCategory)
            .map((cat) => (
              <div key={cat.id}>
                <p className="text-sidebar-muted text-[10px] uppercase tracking-wider px-1 mb-1.5">
                  {cat.label}
                </p>
                <div className="grid grid-cols-8 gap-0.5">
                  {cat.emojis.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.emoji)}
                      title={item.name}
                      className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-sidebar-hover transition-colors"
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
