import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onClear: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreview({ file, previewUrl, onClear }: ImagePreviewProps) {
  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-3 bg-sidebar-hover rounded-xl p-2 pr-3 max-w-xs">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-sidebar-dark">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ImageIcon className="w-3 h-3 text-chat-sent shrink-0" />
            <p className="text-sidebar-text text-xs font-medium truncate">{file.name}</p>
          </div>
          <p className="text-sidebar-muted text-[10px]">{formatFileSize(file.size)}</p>
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          className="p-1 rounded-full hover:bg-sidebar-active text-sidebar-muted hover:text-sidebar-text transition-colors shrink-0"
          title="Remove image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
