"use client";

import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Send 
} from 'lucide-react';

export default function VendorPortalPage() {
  return (
    <>
      {/* Hero / Header Branding Area */}
      <section className="vp-hero">
        <div className="vp-hero-badge">
          <Sparkles size={12} />
          <span>Vendor Workspace</span>
        </div>
        <h1 className="vp-hero-title">Vendor Portal</h1>
        <p className="vp-hero-sub">
          Manage RFQ requests and submit quotations
        </p>
      </section>

      {/* Supporting Vendor Information Cards */}
      <div className="vp-pillars-grid">
        <div className="vp-pillar-card">
          <div className="vp-pillar-icon">
            <Clock size={18} />
          </div>
          <h3 className="vp-pillar-title">Real-Time Inquiries</h3>
          <p className="vp-pillar-desc">
            Stay updated with new RFQ inquiries directly from enterprise procurement teams.
          </p>
        </div>

        <div className="vp-pillar-card">
          <div className="vp-pillar-icon">
            <Send size={18} />
          </div>
          <h3 className="vp-pillar-title">Streamlined Submissions</h3>
          <p className="vp-pillar-desc">
            Input unit prices, lead times, and terms in a structured, guided quotation form.
          </p>
        </div>

        <div className="vp-pillar-card">
          <div className="vp-pillar-icon">
            <ShieldCheck size={18} />
          </div>
          <h3 className="vp-pillar-title">Secure & Verified</h3>
          <p className="vp-pillar-desc">
            Enterprise-grade communications ensuring data integrity and audit readiness.
          </p>
        </div>
      </div>
    </>
  );
}
