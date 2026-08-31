"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const { email, verifyCode, bypassToOrgSelection } = useAuth();

  // 6-digit verification code (pre-populated with realistic demo code "849204")
  const [code, setCode] = useState<string[]>(['8', '4', '9', '2', '0', '4']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendNotif, setResendNotif] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow alphanumeric / digits
    const cleaned = value.replace(/[^0-9a-zA-Z]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = cleaned;
    setCode(newCode);

    // Auto-focus next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9a-zA-Z]/g, '');
    if (pasted.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || '';
      }
      setCode(newCode);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    const fullCode = code.join('');
    verifyCode(fullCode);

    setTimeout(() => {
      setIsVerifying(false);
      router.push('/select-organization');
    }, 500);
  };

  const handleAdminAccess = () => {
    bypassToOrgSelection(email);
    router.push('/select-organization');
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      setResendCooldown(30);
      setResendNotif('A new demo code was dispatched to your inbox.');
      setTimeout(() => setResendNotif(''), 4000);
    }
  };

  return (
    <div className="auth-page-wrapper">
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

        {/* Verification Card */}
        <div className="auth-card">
          <div className="auth-card__icon-badge">
            <KeyRound size={22} />
          </div>

          <div className="auth-card__header auth-card__header--centered">
            <h1 className="auth-card__title">Verify your identity</h1>
            <p className="auth-card__subtitle">
              We sent a 6-digit verification code to
              <strong className="auth-highlight-email"> {email || 'alex.morgan@datatwin.ai'}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="auth-form">
            {/* 6-box OTP Input */}
            <div className="auth-otp-grid">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="auth-otp-input"
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            {resendNotif && <div className="auth-resend-success">{resendNotif}</div>}

            <div className="auth-resend-row">
              <span className="auth-resend-text">Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="auth-resend-btn"
              >
                {resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw size={12} />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.join('').length < 6}
              className="auth-btn auth-btn--primary auth-btn--glow"
            >
              {isVerifying ? (
                <span>Validating authentication token...</span>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Admin Access Section */}
          <div className="auth-admin-card">
            <div className="auth-admin-card__left">
              <div className="auth-admin-card__icon">
                <Building2 size={16} />
              </div>
              <div className="auth-admin-card__content">
                <div className="auth-admin-card__title">Admin Access</div>
                <div className="auth-admin-card__desc">
                  Access organization administration and choose an organization workspace directly.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdminAccess}
              className="auth-btn auth-btn--admin"
            >
              <span>Continue with Admin Access</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Back to Sign In */}
          <div className="auth-back-row">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="auth-back-link"
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="auth-footer-trust">
          <div className="auth-trust-item">
            <ShieldCheck size={14} />
            <span>Encrypted Session Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
