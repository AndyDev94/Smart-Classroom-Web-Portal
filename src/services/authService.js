import { supabase } from './supabaseClient';

export const authService = {
  // Returns current session equivalent
  async getUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  },

  async signUp(email, password) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};
