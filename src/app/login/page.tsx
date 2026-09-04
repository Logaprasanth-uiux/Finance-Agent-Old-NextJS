"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Mail, ArrowRight, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { email, login } = useAuth();
  const [inputEmail, setInputEmail] = useState(email || 'alex.morgan@datatwin.ai');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    login(inputEmail.trim());

    setTimeout(() => {
      setIsLoading(false);
      router.push('/verify');
    }, 450);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Ambient background glowing orbs and grids */}
      <div className="auth-ambient-glow auth-ambient-glow--1" />
      <div className="auth-ambient-glow auth-ambient-glow--2" />
      <div className="auth-grid-pattern" />

      <div className="auth-card-container">
        {/* Brand Header */}
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <Sparkles size={18} />
          </div>
          <div className="auth-brand-text">
            <span className="auth-brand-agentic">Agentic</span>
            <span className="auth-brand-finance">Finance</span>
          </div>
        </div>

        {/* Main Sign In Card */}
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">Welcome back</h1>
            <p className="auth-card__subtitle">
              Sign in to continue to your Agentic Finance enterprise workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                Work Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`auth-input ${error ? 'auth-input--error' : ''}`}
                  autoFocus
                  required
                />
              </div>
              {error && <span className="auth-error-text">{error}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn auth-btn--primary auth-btn--glow"
            >
              {isLoading ? (
                <span>Preparing secure session...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div className="auth-demo-hint" style={{ marginTop: '1rem', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Don't have an account? </span>
            <Link href="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, marginLeft: '0.5rem' }}>
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer Security Certifications */}
        <div className="auth-footer-trust">
          <div className="auth-trust-item">
            <ShieldCheck size={14} />
            <span>256-Bit SSL/TLS</span>
          </div>
          <div className="auth-trust-divider" />
          <div className="auth-trust-item">
            <span>SOC2 Type II Certified</span>
          </div>
          <div className="auth-trust-divider" />
          <div className="auth-trust-item">
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
