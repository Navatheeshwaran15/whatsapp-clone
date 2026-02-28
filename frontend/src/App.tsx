import React from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginPage from './components/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import MessagingLayout from './components/MessagingLayout';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/assets/generated/chatflow-logo.dim_256x256.png"
            alt="ChatFlow"
            className="w-full h-full object-cover"
          />
        </div>
        <svg className="animate-spin w-6 h-6 text-chat-sent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    </div>
  );
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show loading spinner while auth is initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Not authenticated → show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated but profile is still loading — prevent flash
  if (profileLoading && !profileFetched) {
    return <LoadingScreen />;
  }

  // Authenticated but no profile → first-time user, show profile setup
  const showProfileSetup = isAuthenticated && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-sidebar-dark">
        <ProfileSetupModal open={true} />
      </div>
    );
  }

  // Authenticated with profile → show messaging layout
  if (isAuthenticated && userProfile) {
    return <MessagingLayout currentUserProfile={userProfile} />;
  }

  return <LoadingScreen />;
}

export default function App() {
  return <AppContent />;
}
