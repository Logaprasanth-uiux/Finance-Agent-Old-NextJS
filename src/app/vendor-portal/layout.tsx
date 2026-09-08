"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  LogOut, 
  User,
  Store,
  FileSpreadsheet
} from 'lucide-react';

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRfqActive = pathname?.startsWith('/vendor-portal/rfq');

  return (
    <div className="vp-layout">
      {/* 1. Dark Top Navigation Header */}
      <header className="vp-top-header">
        <div className="vp-top-header-inner">
          {/* Brand Logo & Vendor Tag */}
          <Link href="/vendor-portal" className="vp-brand-container">
            <div className="vp-brand-logo-icon">
              <Store size={18} />
            </div>
            <span className="vp-brand-text">DATATWIN</span>
            <span className="vp-brand-badge">VENDOR</span>
          </Link>

          {/* Search Documents Bar */}
          <div className="vp-search-bar">
            <Search size={15} className="vp-search-icon-left" />
            <input 
              type="text" 
              placeholder="Search Documents..." 
              className="vp-search-input"
              readOnly
            />
            <button type="button" className="vp-search-filter-btn" aria-label="Filter">
              <SlidersHorizontal size={12} />
            </button>
          </div>

          {/* User Profile & Exit */}
          <div className="vp-top-nav-right">
            <div className="vp-user-avatar-btn" title="Vendor Profile">
              <User size={16} />
            </div>
            <Link 
              href="/dashboard" 
              className="vp-user-avatar-btn" 
              title="Return to Finance Agent"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Subheader Context / Metadata Bar */}
      <section className="vp-context-bar">
        <div className="vp-context-bar-inner">
          <div className="vp-context-pills">
            <div className="vp-meta-pill">
              <span className="vp-meta-label">VENDOR NAME</span>
              <span className="vp-meta-value">PRIME ASSEMBLIES INC</span>
            </div>

            <div className="vp-meta-pill">
              <span className="vp-meta-label vp-meta-label--blue">COMPANY NAME</span>
              <span className="vp-meta-value">DEMO INDUSTRIAL WORKS PVT. LTD</span>
            </div>

            <div className="vp-meta-pill vp-meta-pill--purple">
              <span className="vp-meta-label vp-meta-label--purple">VENDOR ID</span>
              <span className="vp-meta-value vp-meta-value--purple">V10644</span>
            </div>
          </div>

          <div className="vp-context-actions">
            {/* RFQ Navigation Item */}
            <Link 
              href="/vendor-portal/rfq" 
              className={`vp-nav-pill-btn ${isRfqActive ? 'vp-nav-pill-btn--active' : ''}`}
              title="View RFQ Requests"
            >
              <FileSpreadsheet size={14} className="vp-nav-pill-icon" />
              <span>RFQ</span>
            </Link>

            {/* Back to Finance Agent Action */}
            <Link href="/dashboard" className="vp-back-to-finance-btn" title="Return to Finance Agent">
              <ArrowLeft size={14} />
              <span>Back to Finance Agent</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Main Page Content */}
      <main className="vp-page-body">
        {children}
      </main>
    </div>
  );
}
