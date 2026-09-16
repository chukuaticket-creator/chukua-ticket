import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getProfile, getSession, clearSession, saveSession } from './api';

// ─── Auth context ────────────────────────────────────────────────
// Interim token-based auth. When the Supabase backend lands, replace the body
// of `refresh` and `signIn` with supabase.auth.getSession() /
// onAuthStateChange() — nothing outside this file needs to change.

const AuthContext = createContext({
  user: null, loading: true, signIn: () => {}, signOut: () => {}, refresh: () => {},
});

// Route guards only make sense once there is a working login to pass. This is a
// deliberate opt-in switch rather than something inferred from the Supabase env
// vars: those are already set on Netlify, but api.js still calls /api/* which
// does not exist yet, so inferring from them would lock you out of your own
// dashboard on the live site.
//
// Set VITE_AUTH_ENFORCED = "true" in Netlify only once login actually works.
export const AUTH_ENFORCED = import.meta.env.VITE_AUTH_ENFORCED === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getSession()?.access_token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    const profile = await getProfile();
    setUser(profile);
    setLoading(false);
    return profile;
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = useCallback((res) => {
    // api.login/register already persisted the session; this just mirrors it
    // into React state so guards and the navbar update without a reload.
    if (res?.session) saveSession(res.session);
    if (res?.user && res?.token) setUser(res.user);
    else refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
