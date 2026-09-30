import { create } from 'zustand';
import type { UserProfile } from '@/lib/types';
import { dataService } from '@/services';

interface SessionState {
  user: UserProfile | null;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: true,

  hydrate: async () => {
    set({ isLoading: true });
    const user = await dataService.getCurrentUser();
    set({ user, isLoading: false });
  },

  signIn: async (email, password) => {
    const user = await dataService.signIn(email, password);
    set({ user });
  },

  signUp: async (email, password, displayName) => {
    const user = await dataService.signUp(email, password, displayName);
    set({ user });
  },

  signOut: async () => {
    await dataService.signOut();
    set({ user: null });
  },
}));
