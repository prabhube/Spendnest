import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as authService from '@/services/authService';
import { isSupabaseConfigured } from '@/services/supabase';
import type { UserProfile } from '@/types/user';

type AuthContextValue = {
  loading: boolean;
  profile: UserProfile | null;
  mode: 'local' | 'supabase';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    authService
      .restoreSession()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      mode: isSupabaseConfigured() ? 'supabase' : 'local',
      setProfile,
      signIn: async (email, password) => {
        const next = await authService.signIn(email, password);
        setProfile(next);
      },
      signUp: async (name, email, password) => {
        const next = await authService.signUp(name, email, password);
        setProfile(next);
      },
      signOut: async () => {
        await authService.signOut();
        setProfile(null);
      },
      refreshProfile: async () => {
        const restored = await authService.restoreSession();
        setProfile(restored);
      },
    }),
    [loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
