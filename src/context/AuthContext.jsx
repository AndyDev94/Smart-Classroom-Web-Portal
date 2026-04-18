import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initial session check on mount, mirroring Supabase getSession()
    const checkSession = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await authService.signUp(email, password);
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const { error } = await authService.signOut();
    if (error) throw error;
    setUser(null);
  };

  const value = {
    user,
    authLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {authLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
          <div className="glow-effect" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
