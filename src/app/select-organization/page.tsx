"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockOrganizations } from '@/data/authMockData';
import type { Organization } from '@/types/auth';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Layers,
  UserCheck,
} from 'lucide-react';

export default function SelectOrgPage() {
  const router = useRouter();
  const { email, selectOrg } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-vms');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [launchingOrgName, setLaunchingOrgName] = useState<string>('');

  const handleSelectAndLaunch = (org: Organization) => {
    setSelectedOrgId(org.id);
    setIsLaunching(true);
    setLaunchingOrgName(org.name);

    selectOrg(org.id);

    setTimeout(() => {
      // Direct navigation into the Agentic Finance Application Dashboard
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page-wrapper auth-page-wrapper--wide">
      <div className="auth-ambient-glow auth-ambient-glow--1" />
      <div className="auth-ambient-glow auth-ambient-glow--2" />
      <div className="auth-grid-pattern" />

      <div className="auth-org-container">
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

        {/* Page Title & User Session Header */}
        <div className="auth-org-header">
          <h1 className="auth-org-title">Select Organization</h1>
          <p className="auth-org-subtitle">
            Choose an organization workspace to access its procurement, financial ledgers, and transaction tools.
          </p>
          <div className="auth-org-user-pill">
            <UserCheck size={13} className="auth-icon-indigo" />
            <span>Authenticated as <strong>{email || 'alex.morgan@datatwin.ai'}</strong></span>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="auth-org-grid">
          {mockOrganizations.map((org) => {
            const isSelected = selectedOrgId === org.id;
            const isPrimary = org.id === 'org-vms';

            return (
              <div
                key={org.id}
                onClick={() => handleSelectAndLaunch(org)}
                className={`auth-org-card ${
                  isSelected ? 'auth-org-card--selected' : ''
                } ${isPrimary ? 'auth-org-card--primary' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectAndLaunch(org);
                  }
                }}
              >
                {/* Top Badge (if applicable) */}
                {org.badge && (
                  <div className="auth-org-card__badge">
                    <Sparkles size={11} />
                    <span>{org.badge}</span>
                  </div>
                )}

                {/* Card Main Info */}
                <div className="auth-org-card__header">
                  <div
                    className="auth-org-card__avatar"
                    style={{ background: org.logoGradient }}
                  >
                    {org.logoInitial}
                  </div>

                  <div className="auth-org-card__title-block">
                    <h3 className="auth-org-card__name">{org.name}</h3>
                    <span className="auth-org-card__category">{org.category}</span>
                  </div>
                </div>

                {/* Modules Chips */}
                <div className="auth-org-card__modules">
                  <div className="auth-org-card__modules-label">
                    <Layers size={12} />
                    <span>Active Modules:</span>
                  </div>
                  <div className="auth-org-card__pills">
                    {org.activeModules.map((mod, i) => (
                      <span key={i} className="auth-module-pill">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="auth-org-card__footer">
                  <span className="auth-org-card__role">Role: <strong>{org.role}</strong></span>
                  <div className="auth-org-card__action-btn">
                    <span>Open Workspace</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Launching Loading Modal Overlay */}
        {isLaunching && (
          <div className="auth-launching-overlay">
            <div className="auth-launching-modal">
              <div className="auth-launching-spinner" />
              <div className="auth-launching-text">
                <h3>Launching {launchingOrgName}...</h3>
                <p>Initializing workspace preferences, ERP integrations &amp; security tokens.</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="auth-footer-trust">
          <div className="auth-trust-item">
            <Building2 size={14} />
            <span>Multi-Tenant Enterprise Isolation</span>
          </div>
          <div className="auth-trust-divider" />
          <div className="auth-trust-item">
            <ShieldCheck size={14} />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="auth-trust-divider" />
          <div className="auth-trust-item">
            <CheckCircle2 size={14} />
            <span>Audit-Logged Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
