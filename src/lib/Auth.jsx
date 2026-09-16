import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getProfile } from './api';

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
    if (!localStorage.getItem('ct_token')) {
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
    if (res?.token) localStorage.setItem('ct_token', res.token);
    if (res?.user) setUser(res.user);
    else refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    localStorage.removeItem('ct_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
