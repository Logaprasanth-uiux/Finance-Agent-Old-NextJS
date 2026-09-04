"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, ShieldCheck, Sparkles, User, Building, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!company.trim()) {
      setError('Please enter your company name.');
      return;
    }
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Mock signup logic (using existing login context method)
    login(inputEmail.trim());

    setTimeout(() => {
      setIsLoading(false);
      router.push('/verify');
    }, 600);
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

        {/* Main Sign Up Card */}
        <div className="auth-card" style={{ padding: '2rem 2.5rem' }}>
          <div className="auth-card__header" style={{ marginBottom: '1.5rem' }}>
            <h1 className="auth-card__title">Create your workspace</h1>
            <p className="auth-card__subtitle">
              Join Agentic Finance to automate your enterprise financial operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1rem' }}>
            
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="name" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <User size={17} className="auth-input-icon" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`auth-input ${error && error.includes('name') ? 'auth-input--error' : ''}`}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="company" className="auth-label">
                Company
              </label>
              <div className="auth-input-wrapper">
                <Building size={17} className="auth-input-icon" />
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className={`auth-input ${error && error.includes('company') ? 'auth-input--error' : ''}`}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" className="auth-label">
                Work Email
              </label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className={`auth-input ${error && error.includes('email') ? 'auth-input--error' : ''}`}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`auth-input ${error && error.includes('Password') ? 'auth-input--error' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: agreeTerms ? 'var(--primary)' : 'var(--text-tertiary)',
                  marginTop: '2px',
                  display: 'flex',
                  transition: 'color 0.2s ease'
                }}
              >
                {agreeTerms ? <CheckCircle2 size={16} /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid var(--border-color)', boxSizing: 'border-box' }} />}
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                I agree to the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a>.
              </span>
            </div>

            {error && <div className="auth-error-text" style={{ marginTop: '-0.25rem' }}>{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn auth-btn--primary auth-btn--glow"
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? (
                <span>Creating workspace...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-demo-hint" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Already have an account? </span>
            <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, marginLeft: '0.5rem' }}>
              Log in
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
