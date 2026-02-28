import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';
import type { Principal } from '@dfinity/principal';

// ─── User Profile Hooks ───────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

/**
 * useRegisterUser — open to guests (no #user role required).
 * First-time users must call this to register and obtain the #user role.
 * After success, invalidates the profile cache so App.tsx re-evaluates auth state.
 */
export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      avatar,
      status,
    }: {
      username: string;
      avatar: string;
      status: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(username, avatar, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      // Invalidate actor so it re-initializes with the new role
      queryClient.invalidateQueries({ queryKey: ['actor'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetUserProfile(target: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return null;
      try {
        return await actor.getUserProfile(target);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!target,
    refetchInterval: 10000,
  });
}

export function useIsUserOnline(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['userOnline', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      return actor.isUserOnline(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    refetchInterval: 10000,
  });
}

export function useUpdateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Conversation / Message Hooks ─────────────────────────────────────────────

/**
 * Generates a deterministic conversation ID from two principal strings.
 * Sorts them so A↔B and B↔A produce the same ID.
 */
export function getConversationId(principalA: string, principalB: string): string {
  const sorted = [principalA, principalB].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

export function useSendMessage(conversationId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(conversationId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

export function useSendImageMessage(conversationId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, imageFile }: { content: string; imageFile: File }) => {
      if (!actor) throw new Error('Actor not available');

      // Convert File to Uint8Array
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBlob = new Uint8Array(arrayBuffer);

      return actor.sendImageMessage(conversationId, content, imageBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}
