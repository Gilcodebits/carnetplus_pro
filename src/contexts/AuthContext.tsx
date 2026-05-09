import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'medecin' | 'secretaire' | 'labo' | 'patient' | 'gestionnaire';
  etablissement_id: number;
  etablissement_nom: string;
  photo?: string;
  telephone?: string;
  groupe_sanguin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (newData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  // Restaurer session au chargement
  useEffect(() => {
    const token = localStorage.getItem('cp_token');
    if (token) {
      authAPI.me()
        .then(setUser)
        .catch(() => localStorage.removeItem('cp_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { token, user } = await authAPI.login(email, password);
      localStorage.setItem('cp_token', token);
      setUser(user);
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
      throw e;
    }
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('cp_token');
    setUser(null);
  };

  const clearError = () => setError(null);

  const updateUser = (newData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...newData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
