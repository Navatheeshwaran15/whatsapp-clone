import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRegisterUser } from '../hooks/useQueries';
import { UserCircle } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('Hey there! I am using ChatFlow.');
  const [errorMsg, setErrorMsg] = useState('');
  const registerUser = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setErrorMsg('');

    try {
      await registerUser.mutateAsync({
        username: username.trim(),
        avatar: '',
        status: status.trim() || 'Hey there! I am using ChatFlow.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-sidebar-dark border-sidebar-hover text-sidebar-text max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-chat-sent flex items-center justify-center">
              <UserCircle className="w-9 h-9 text-chat-sent-text" />
            </div>
          </div>
          <DialogTitle className="text-center text-sidebar-text text-xl">
            Set up your profile
          </DialogTitle>
          <DialogDescription className="text-center text-sidebar-muted">
            Tell others who you are. You can change this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="w-full px-3 py-2.5 rounded-lg bg-sidebar-hover border border-sidebar-active text-sidebar-text placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-chat-sent text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Status
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-lg bg-sidebar-hover border border-sidebar-active text-sidebar-text placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-chat-sent text-sm"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={!username.trim() || registerUser.isPending}
            className="w-full py-3 rounded-xl font-semibold text-chat-sent-text bg-chat-sent hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {registerUser.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
