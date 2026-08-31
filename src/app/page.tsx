"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, selectedOrg } = useAuth();

  useEffect(() => {
    const hasAuth = localStorage.getItem('agentic_finance_auth') === 'true';
    const hasOrg = localStorage.getItem('agentic_finance_org');

    if ((isAuthenticated || hasAuth) && (selectedOrg || hasOrg)) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, selectedOrg, router]);

  return (
    <div className="auth-launching-overlay">
      <div className="auth-launching-modal">
        <div className="auth-launching-spinner" />
        <div className="auth-launching-text">
          <h3>Initializing workspace...</h3>
        </div>
      </div>
    </div>
  );
}
