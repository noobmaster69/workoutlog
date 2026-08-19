import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, isSupabaseConfigured } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { AuthUser } from "../lib/types";

type AuthMode = "supabase" | "local";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  mode: AuthMode;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function displayNameFrom(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  return user.email?.split("@")[0] || "Athlete";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mode: AuthMode = isSupabaseConfigured ? "supabase" : "local";

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const sessionUser = data.session?.user;
          if (!cancelled && sessionUser?.email) {
            setUser({
              id: sessionUser.id,
              email: sessionUser.email,
              displayName: displayNameFrom(sessionUser),
            });
          }
        } else {
          const local = await api.currentLocalUser();
          if (!cancelled) setUser(local);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const authListener = supabase?.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser?.email) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          displayName: displayNameFrom(sessionUser),
        });
      } else {
        setUser(null);
      }
    });

    void boot();
    return () => {
      cancelled = true;
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      mode,
      async signIn(email, password) {
        if (supabase) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new Error(error.message);
          return;
        }
        setUser(await api.signInLocal(email, password));
      },
      async signUp(email, password, displayName) {
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName } },
          });
          if (error) throw new Error(error.message);
          return { needsEmailConfirm: !data.session };
        }
        setUser(await api.signUpLocal(email, password, displayName));
        return { needsEmailConfirm: false };
      },
      async signOut() {
        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) throw new Error(error.message);
          setUser(null);
          return;
        }
        api.signOutLocal();
        setUser(null);
      },
    }),
    [user, loading, mode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
