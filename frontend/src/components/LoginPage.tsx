import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sidebar-dark">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/assets/generated/chatflow-logo.dim_256x256.png"
              alt="ChatFlow"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-sidebar-text tracking-tight">ChatFlow</h1>
            <p className="text-sidebar-muted text-sm mt-1">Simple. Fast. Secure.</p>
          </div>
        </div>

        {/* Features */}
        <div className="w-full space-y-3">
          {[
            { icon: MessageCircle, text: 'Real-time messaging with anyone' },
            { icon: Shield, text: 'Secured by Internet Identity' },
            { icon: Zap, text: 'Fast and decentralized on ICP' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sidebar-muted">
              <Icon className="w-4 h-4 text-chat-sent shrink-0" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <button
          onClick={handleAuth}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-chat-sent-text bg-chat-sent hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
        >
          {isLoggingIn ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting...
            </span>
          ) : (
            'Get Started'
          )}
        </button>

        <p className="text-sidebar-muted text-xs text-center">
          By continuing, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
