import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/user';
import { clearAuth, getAuth } from '../utils/authStorage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Hydrate from backend auth storage if present.
  useEffect(() => {
    const stored = getAuth();
    if (!stored) return;

    setUser(prev => {
      if (prev) return prev;

      // Map backend role to existing app role shape.
      const role = stored.role?.toLowerCase() === 'broker' ? 'broker' : 'carrier';

      const minimalUser: UserProfile = {
        id: stored.userId,
        role,
        email: stored.email,
        phoneNumber: '',
        phoneVerified: true,
        companyName: role === 'broker' ? 'Broker' : 'Carrier',
        mcNumber: '',
        dotNumber: '',
        insuranceCompany: '',
        cargoInsurance: 0,
        liabilityInsurance: 0,
        taxId: '',
        taxIdType: 'EIN',
        fmcsaVerified: true,
        mailingAddress: '',
        city: '',
        state: '',
        zipCode: '',
        createdAt: new Date().toISOString(),
      };

      return minimalUser;
    });
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = (userProfile: UserProfile) => {
    setUser(userProfile);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    clearAuth();
  };

  const updateUser = (userProfile: UserProfile) => {
    setUser(userProfile);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      // Backend auth is based on bearer token; don't block on demo verification flags.
      isAuthenticated: !!user && !!getAuth()?.token,
      login, 
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
