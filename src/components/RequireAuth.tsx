"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, selectedOrg } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage fallback for fast hydration
    const hasAuth = localStorage.getItem('agentic_finance_auth') === 'true';
    const hasOrg = localStorage.getItem('agentic_finance_org');

    if (!isAuthenticated && !hasAuth) {
      router.replace('/login');
    } else if (!selectedOrg && !hasOrg) {
      router.replace('/select-organization');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, selectedOrg, router]);

  if (isChecking) {
    return (
      <div className="auth-launching-overlay">
        <div className="auth-launching-modal">
          <div className="auth-launching-spinner" />
          <div className="auth-launching-text">
            <h3>Verifying session...</h3>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
