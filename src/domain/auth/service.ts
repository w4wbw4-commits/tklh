import { db } from "@/domain/client";

// ---------------------------------------------------------------------------
// auth domain — thin, transport-agnostic wrapper. The React session lives in
// `useAuth`; this module is what a mobile client mirrors.
// ---------------------------------------------------------------------------

export const getSession = () => db.auth.getSession();
export const getUser = () => db.auth.getUser();
export const signOut = () => db.auth.signOut();

export const signInWithPassword = (email: string, password: string) =>
  db.auth.signInWithPassword({ email, password });

export const signUpWithPassword = (
  email: string,
  password: string,
  options?: { data?: Record<string, unknown>; emailRedirectTo?: string },
) => db.auth.signUp({ email, password, options });

export const resetPasswordForEmail = (email: string, redirectTo?: string) =>
  db.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);

export const updatePassword = (password: string) => db.auth.updateUser({ password });

export const onAuthStateChange: typeof db.auth.onAuthStateChange = (cb) =>
  db.auth.onAuthStateChange(cb);

export const setSession = (accessToken: string, refreshToken: string) =>
  db.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
