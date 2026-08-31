"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Organization, AuthState } from '../types/auth';
import { mockOrganizations } from '../data/authMockData';

interface AuthContextType extends AuthState {
  login: (email: string) => void;
  verifyCode: (code: string) => boolean;
  selectOrg: (orgId: string) => void;
  logout: () => void;
  bypassToOrgSelection: (email?: string) => void;
}

const STORAGE_KEY_AUTH = 'agentic_finance_auth';
const STORAGE_KEY_ORG = 'agentic_finance_org';
const STORAGE_KEY_EMAIL = 'agentic_finance_email';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('alex.morgan@datatwin.ai');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
      const savedEmail = localStorage.getItem(STORAGE_KEY_EMAIL) || 'alex.morgan@datatwin.ai';
      const savedOrgId = localStorage.getItem(STORAGE_KEY_ORG);
      const org = savedOrgId ? mockOrganizations.find((o) => o.id === savedOrgId) || null : null;

      setIsAuthenticated(savedAuth);
      setEmail(savedEmail);
      setSelectedOrg(org);
      setIsInitialized(true);
    }
  }, []);

  const login = (userEmail: string) => {
    const finalEmail = userEmail.trim() || 'alex.morgan@datatwin.ai';
    setEmail(finalEmail);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_EMAIL, finalEmail);
    }
  };

  const verifyCode = (_code: string) => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    }
    return true;
  };

  const bypassToOrgSelection = (userEmail?: string) => {
    if (userEmail) {
      login(userEmail);
    }
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    }
  };

  const selectOrg = (orgId: string) => {
    const org = mockOrganizations.find((o) => o.id === orgId) || mockOrganizations[0];
    setSelectedOrg(org);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_ORG, org.id);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSelectedOrg(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_ORG);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        email,
        selectedOrg,
        login,
        verifyCode,
        selectOrg,
        logout,
        bypassToOrgSelection,
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

export default AuthContext;
