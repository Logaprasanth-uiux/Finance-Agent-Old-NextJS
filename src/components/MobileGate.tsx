"use client";

import React, { useState, useEffect } from 'react';
import { Laptop, ArrowRight, Sparkles, CheckCircle2, RotateCcw, Monitor } from 'lucide-react';

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = 'agentic_finance_desktop_mode';

const DesktopWorkspaceIllustration: React.FC = () => {
  return (
    <svg
      viewBox="0 0 280 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mobile-gate-illustration"
      aria-label="Desktop Workspace Illustration"
    >
      <defs>
        <linearGradient id="screenBg" x1="0" y1="0" x2="240" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E2438" />
          <stop offset="100%" stopColor="#0F1422" />
        </linearGradient>
        <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
        </linearGradient>
        <filter id="cardShadow" x="-10" y="-10" width="300" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.28" />
        </filter>
        <filter id="floatShadow" x="-6" y="-6" width="100" height="60" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Stand Base */}
      <ellipse cx="140" cy="165" rx="55" ry="5" fill="#1E293B" opacity="0.6" />
      <path d="M126 148 L116 163 H164 L154 148 Z" fill="#334155" />
      <rect x="131" y="138" width="18" height="12" rx="2" fill="#475569" />

      {/* Monitor Outer Frame */}
      <rect x="25" y="14" width="230" height="128" rx="9" fill="#0F172A" stroke="#334155" strokeWidth="2" filter="url(#cardShadow)" />
      
      {/* Monitor Screen Bezel */}
      <rect x="29" y="18" width="222" height="120" rx="6" fill="url(#screenBg)" />

      {/* Top Window Bar */}
      <rect x="29" y="18" width="222" height="15" rx="6" fill="#141A29" />
      <circle cx="39" cy="25.5" r="2.5" fill="#EF4444" />
      <circle cx="47" cy="25.5" r="2.5" fill="#F59E0B" />
      <circle cx="55" cy="25.5" r="2.5" fill="#10B981" />
      <rect x="68" y="22.5" width="55" height="6" rx="3" fill="#2D3748" />

      {/* Screen Sidebar */}
      <rect x="29" y="33" width="36" height="105" fill="#101524" />
      <rect x="35" y="40" width="24" height="4" rx="2" fill="#4F46E5" />
      <rect x="35" y="49" width="20" height="3" rx="1.5" fill="#2D3748" />
      <rect x="35" y="56" width="18" height="3" rx="1.5" fill="#2D3748" />
      <rect x="35" y="63" width="22" height="3" rx="1.5" fill="#2D3748" />
      <rect x="35" y="70" width="16" height="3" rx="1.5" fill="#2D3748" />

      {/* Screen Main Content Area */}
      {/* Header bar inside app */}
      <rect x="73" y="39" width="60" height="6" rx="3" fill="#E2E8F0" opacity="0.9" />
      <rect x="208" y="38" width="34" height="8" rx="4" fill="url(#primaryGrad)" />

      {/* Metric Cards Row */}
      <rect x="73" y="50" width="52" height="22" rx="4" fill="#1A2234" stroke="#263147" strokeWidth="1" />
      <rect x="78" y="54" width="20" height="3" rx="1.5" fill="#64748B" />
      <rect x="78" y="60" width="28" height="6" rx="2" fill="#38BDF8" />

      <rect x="131" y="50" width="52" height="22" rx="4" fill="#1A2234" stroke="#263147" strokeWidth="1" />
      <rect x="136" y="54" width="24" height="3" rx="1.5" fill="#64748B" />
      <rect x="136" y="60" width="32" height="6" rx="2" fill="#818CF8" />

      <rect x="189" y="50" width="53" height="22" rx="4" fill="#1A2234" stroke="#263147" strokeWidth="1" />
      <rect x="194" y="54" width="22" height="3" rx="1.5" fill="#64748B" />
      <rect x="194" y="60" width="30" height="6" rx="2" fill="#34D399" />

      {/* Chart & Table Multi-column Layout */}
      {/* Mini Area Chart */}
      <rect x="73" y="78" width="80" height="52" rx="4" fill="#161C2E" stroke="#263147" strokeWidth="1" />
      <rect x="78" y="83" width="30" height="3" rx="1.5" fill="#64748B" />
      <path d="M78 120 L88 109 L100 114 L114 100 L126 105 L138 94 L148 99 V122 H78 Z" fill="url(#chartGrad)" />
      <path d="M78 120 L88 109 L100 114 L114 100 L126 105 L138 94 L148 99" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="138" cy="94" r="2" fill="#38BDF8" />

      {/* Mini Data Grid / Comparison Table */}
      <rect x="160" y="78" width="82" height="52" rx="4" fill="#161C2E" stroke="#263147" strokeWidth="1" />
      <rect x="165" y="83" width="35" height="3" rx="1.5" fill="#64748B" />
      
      {/* Table rows */}
      <rect x="165" y="89" width="72" height="6" rx="1.5" fill="#1E273D" />
      <rect x="168" y="91" width="18" height="2" rx="1" fill="#94A3B8" />
      <rect x="210" y="91" width="12" height="2" rx="1" fill="#34D399" />

      <rect x="165" y="98" width="72" height="6" rx="1.5" fill="#1E273D" />
      <rect x="168" y="100" width="22" height="2" rx="1" fill="#94A3B8" />
      <rect x="210" y="100" width="16" height="2" rx="1" fill="#38BDF8" />

      <rect x="165" y="107" width="72" height="6" rx="1.5" fill="#1E273D" />
      <rect x="168" y="109" width="16" height="2" rx="1" fill="#94A3B8" />
      <rect x="210" y="109" width="14" height="2" rx="1" fill="#818CF8" />

      <rect x="165" y="116" width="72" height="6" rx="1.5" fill="#1E273D" />
      <rect x="168" y="118" width="20" height="2" rx="1" fill="#94A3B8" />
      <rect x="210" y="118" width="10" height="2" rx="1" fill="#34D399" />

      {/* Floating Badge (RFQ Spec Match / Analytics) */}
      <g filter="url(#floatShadow)">
        <rect x="14" y="84" width="60" height="26" rx="6" fill="#1E2235" stroke="#374151" strokeWidth="1" />
        <circle cx="24" cy="97" r="4.5" fill="#10B981" />
        <path d="M22 97 L23.5 98.5 L26 95.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="33" y="93" width="30" height="3" rx="1.5" fill="#F1F5F9" />
        <rect x="33" y="98" width="20" height="2" rx="1" fill="#10B981" />
      </g>

      {/* Floating Badge Right (Financial Analytics / AI) */}
      <g filter="url(#floatShadow)">
        <rect x="210" y="20" width="60" height="24" rx="6" fill="#1E2235" stroke="#4F46E5" strokeWidth="1" />
        <circle cx="220" cy="32" r="3.5" fill="#6366F1" />
        <rect x="227" y="28" width="34" height="3" rx="1.5" fill="#F1F5F9" />
        <rect x="227" y="33" width="22" height="2" rx="1" fill="#818CF8" />
      </g>
    </svg>
  );
};

export const MobileGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [forceDesktop, setForceDesktop] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    // Retrieve saved desktop mode preference for current session
    try {
      const storedPreference = sessionStorage.getItem(STORAGE_KEY);
      if (storedPreference === 'true') {
        setForceDesktop(true);
      }
    } catch {
      // Ignore sessionStorage access exceptions if any
    }

    const checkViewport = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // When forced desktop is active on mobile viewport, allow horizontal scrolling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (forceDesktop && isMobile) {
        document.body.classList.add('desktop-mode-override');
      } else {
        document.body.classList.remove('desktop-mode-override');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('desktop-mode-override');
      }
    };
  }, [forceDesktop, isMobile]);

  const handleContinueDesktop = () => {
    setForceDesktop(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  const handleReturnToMobileNotice = () => {
    setForceDesktop(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // SSR or before mount: render children directly to prevent hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // If on mobile viewport and user has not chosen to continue in desktop view
  if (isMobile && !forceDesktop) {
    return (
      <div className="mobile-gate-overlay">
        {/* Ambient background glows */}
        <div className="mobile-gate-glow mobile-gate-glow--1" />
        <div className="mobile-gate-glow mobile-gate-glow--2" />
        <div className="mobile-gate-grid-pattern" />

        <div className="mobile-gate-content">
          {/* Brand header */}
          <div className="mobile-gate-brand">
            <div className="mobile-gate-brand-icon">
              <Sparkles size={16} />
            </div>
            <div className="mobile-gate-brand-text">
              <span className="brand-agentic">Agentic</span>
              <span className="brand-finance">Finance</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="mobile-gate-card">
            {/* Tasteful Desktop Workspace Illustration */}
            <div className="mobile-gate-illustration-wrapper">
              <DesktopWorkspaceIllustration />
            </div>

            {/* Typography */}
            <div className="mobile-gate-header">
              <h1 className="mobile-gate-title">Designed for a Larger Screen</h1>
              <p className="mobile-gate-description">
                DataTwin Finance Agent is optimized for desktop and larger screens to provide the best experience when working with detailed RFQs, specifications, quotations, and financial information.
              </p>
            </div>

            {/* Feature summary pills */}
            <div className="mobile-gate-features">
              <div className="mobile-gate-feature-pill">
                <CheckCircle2 size={13} className="feature-icon" />
                <span>Multi-column RFQs & tables</span>
              </div>
              <div className="mobile-gate-feature-pill">
                <CheckCircle2 size={13} className="feature-icon" />
                <span>Side-by-side vendor comparisons</span>
              </div>
              <div className="mobile-gate-feature-pill">
                <CheckCircle2 size={13} className="feature-icon" />
                <span>Complex financial workflows</span>
              </div>
            </div>

            {/* Action */}
            <div className="mobile-gate-action">
              <button
                type="button"
                onClick={handleContinueDesktop}
                className="mobile-gate-btn"
              >
                <span>Continue in Desktop View</span>
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Subtext */}
            <div className="mobile-gate-hint">
              <Laptop size={14} className="hint-icon" />
              <span>Best experienced on desktop</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render full desktop application
  return (
    <>
      {children}
      {isMobile && forceDesktop && (
        <div className="desktop-mode-banner-floating">
          <div className="desktop-mode-banner-content">
            <Monitor size={14} />
            <span>Desktop View</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToMobileNotice}
            className="desktop-mode-banner-btn"
            title="Return to mobile experience notice"
          >
            <RotateCcw size={12} />
            <span>Show Notice</span>
          </button>
        </div>
      )}
    </>
  );
};

export default MobileGate;
