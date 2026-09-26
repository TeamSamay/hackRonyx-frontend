import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, DemoPersona, UserRole, ClearanceLevel } from '@/types/auth';

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'persona-1',
    name: 'Dr. Evelyn Vance',
    role: 'Lead Forensic Auditor',
    email: 'evelyn.vance@aegis-forensics.io',
    organization: 'Aegis Forensics Global',
    clearanceLevel: 'Level 3 - Gate Authority',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Full authorization to override trust gates and sign off on TX-92831 forensic anomalies.',
  },
  {
    id: 'persona-2',
    name: 'Julian Sterling, Esq.',
    role: 'Senior Legal Counsel',
    email: 'j.sterling@sterling-partners.law',
    organization: 'Sterling & Co. Arbitration Group',
    clearanceLevel: 'Level 2 - Legal Review',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    description: 'Specialized in multi-jurisdictional contract disputes & deterministic compliance arbitration.',
  },
  {
    id: 'persona-3',
    name: 'Marcus Chen',
    role: 'Chief Risk Officer',
    email: 'marcus.chen@citadel-underwrite.com',
    organization: 'Citadel Enterprise Underwriters',
    clearanceLevel: 'Top Secret (TS-SCI)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Executive risk oversight & algorithmic anomaly verification across portfolio claims.',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithSSO: (providerName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPersona: (persona: DemoPersona) => void;
  registerAccount: (data: {
    name: string;
    email: string;
    organization: string;
    role: UserRole;
    clearanceLevel: ClearanceLevel;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'verdict_ai_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginWithPersona = (persona: DemoPersona) => {
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      organization: persona.organization,
      clearanceLevel: persona.clearanceLevel,
      provider: 'demo',
      avatar: `https://images.unsplash.com/photo-${
        persona.id === 'persona-1'
          ? '1573496359142-b8d87734a5a2'
          : persona.id === 'persona-2'
            ? '1534528741775-53994a69daeb'
            : '1507003211169-0a1dd7228f2d'
      }?w=150&auto=format&fit=crop&q=80`,
      token: `jwt_verdict_demo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const googleUser: AuthUser = {
      id: `usr-g-${Date.now()}`,
      name: 'Alexander Ross',
      email: 'alex.ross@enterprisegov.org',
      role: 'Lead Forensic Auditor',
      organization: 'Enterprise Forensic Trust Consortium',
      clearanceLevel: 'Level 3 - Gate Authority',
      provider: 'google',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      token: `g_oauth2_token_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setUser(googleUser);
    setIsLoading(false);
    return { success: true };
  };

  const loginWithSSO = async (providerName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 750));

    const ssoUser: AuthUser = {
      id: `usr-sso-${Date.now()}`,
      name: 'Enterprise Security Lead',
      email: `security.auditor@${providerName.toLowerCase().replace(/[^a-z0-9]/g, '')}-vault.internal`,
      role: 'Enterprise Administrator',
      organization: `${providerName} Federated Identity`,
      clearanceLevel: 'Top Secret (TS-SCI)',
      provider: 'sso',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      token: `sso_saml_token_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setUser(ssoUser);
    setIsLoading(false);
    return { success: true };
  };

  const loginWithEmail = async (
    email: string,
    pass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid enterprise work email address.' };
    }
    if (!pass || pass.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Auditor';

    const domain = email.split('@')[1] || 'enterprise.com';
    const orgName = domain.split('.')[0].toUpperCase() + ' Security & Compliance';

    const emailUser: AuthUser = {
      id: `usr-mail-${Date.now()}`,
      name: formattedName,
      email: email.toLowerCase().trim(),
      role: 'Lead Forensic Auditor',
      organization: orgName,
      clearanceLevel: 'Level 2 - Legal Review',
      provider: 'email',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      token: `jwt_email_auth_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setUser(emailUser);
    setIsLoading(false);
    return { success: true };
  };

  const registerAccount = async (data: {
    name: string;
    email: string;
    organization: string;
    role: UserRole;
    clearanceLevel: ClearanceLevel;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!data.name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Please provide your full legal name.' };
    }
    if (!data.email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid corporate or law firm email.' };
    }
    if (data.password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Security passphrase must be at least 6 characters.' };
    }

    const newUser: AuthUser = {
      id: `usr-reg-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      organization: data.organization.trim() || 'Global Risk Operations',
      role: data.role,
      clearanceLevel: data.clearanceLevel,
      provider: 'email',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      token: `jwt_registered_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        loginWithSSO,
        loginWithPersona,
        registerAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
