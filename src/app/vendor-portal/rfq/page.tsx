"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { RFQRecord } from '@/types/rfq';
import { mockCompanyRFQs } from '@/data/rfqMockData';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Package, 
  ArrowRight, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck,
  Send,
  Layers
} from 'lucide-react';

const CURRENT_VENDOR_NAME = 'Acme Global';

// Helper to determine if an RFQ belongs to the current mock vendor (Acme Global)
function isVendorRFQ(rfq: RFQRecord, vendorName = CURRENT_VENDOR_NAME): boolean {
  const normVendor = vendorName.toLowerCase();
  const inVendorsList = rfq.vendors?.some((v) => 
    v.toLowerCase().includes(normVendor) || v.toLowerCase().includes('acme global technologies')
  );
  const inVendorResponses = rfq.vendorResponses?.some((vr) => 
    vr.vendorName.toLowerCase().includes(normVendor)
  );
  return Boolean(inVendorsList || inVendorResponses);
}

// Helper to calculate presentation state from the vendor's perspective
function getVendorRFQPresentation(rfq: RFQRecord, vendorName = CURRENT_VENDOR_NAME) {
  const normVendor = vendorName.toLowerCase();
  const vendorResponse = rfq.vendorResponses?.find((vr) =>
    vr.vendorName.toLowerCase().includes(normVendor)
  );

  const hasSubmitted = 
    vendorResponse?.status === 'Quotation Received' || 
    vendorResponse?.status === 'Quotation Approved';

  const isApproved = vendorResponse?.status === 'Quotation Approved';
  const isClosed = rfq.status === 'Closed';
  const isExpiringSoon = !hasSubmitted && !isClosed && (rfq.isUrgent || rfq.status === 'Closing Soon');
  const isNew = !hasSubmitted && !isClosed;

  let vendorStatusLabel = 'Awaiting Quotation';
  let badgeClass = 'vp-status-badge--blue';
  let badgeIcon = <Clock size={12} />;

  if (isClosed) {
    vendorStatusLabel = 'Closed';
    badgeClass = 'vp-status-badge--gray';
    badgeIcon = <CheckCircle2 size={12} />;
  } else if (isApproved) {
    vendorStatusLabel = 'Quote Approved';
    badgeClass = 'vp-status-badge--purple';
    badgeIcon = <ShieldCheck size={12} />;
  } else if (hasSubmitted) {
    vendorStatusLabel = 'Quote Submitted';
    badgeClass = 'vp-status-badge--green';
    badgeIcon = <CheckCircle2 size={12} />;
  } else if (isExpiringSoon) {
    vendorStatusLabel = 'Expiring Soon';
    badgeClass = 'vp-status-badge--urgent';
    badgeIcon = <AlertCircle size={12} />;
  }

  return {
    vendorStatusLabel,
    badgeClass,
    badgeIcon,
    hasSubmitted,
    isApproved,
    isClosed,
    isExpiringSoon,
    isNew,
    quotationValue: vendorResponse?.quotationValue,
    submittedDate: vendorResponse?.submittedDate,
  };
}

export default function VendorPortalRFQPage() {
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'new' | 'expiring' | 'submitted' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncCount, setSyncCount] = useState(0);

  // Sync client-side submitted quotes from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let hasChanges = false;
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('vp_quote_meta_')) {
          const rfqId = key.replace('vp_quote_meta_', '');
          const metaStr = localStorage.getItem(key);
          if (metaStr) {
            const meta = JSON.parse(metaStr);
            Object.values(mockCompanyRFQs).forEach((companyGroup) => {
              const rfq = [...companyGroup.running, ...companyGroup.completed].find((r) => r.id === rfqId);
              if (rfq) {
                if (!rfq.vendorResponses) rfq.vendorResponses = [];
                const exist = rfq.vendorResponses.find((vr) =>
                  vr.vendorName.toLowerCase().includes(CURRENT_VENDOR_NAME.toLowerCase())
                );
                if (exist) {
                  exist.status = 'Quotation Received';
                  exist.quotationValue = meta.totalAmount;
                  exist.submittedDate = meta.submittedDate;
                  exist.submittedTime = meta.submittedTime;
                } else {
                  rfq.vendorResponses.push({
                    vendorId: 'v-1',
                    vendorName: CURRENT_VENDOR_NAME,
                    status: 'Quotation Received',
                    quotationValue: meta.totalAmount,
                    submittedDate: meta.submittedDate,
                    submittedTime: meta.submittedTime,
                  });
                }
                hasChanges = true;
              }
            });
          }
        }
      });
      if (hasChanges) {
        setSyncCount((prev) => prev + 1);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Extract all unique RFQs belonging to Acme Global across company datasets
  const allVendorRFQs = useMemo(() => {
    const rfqMap = new Map<string, RFQRecord>();

    Object.values(mockCompanyRFQs).forEach((companyGroup) => {
      const combined = [...companyGroup.running, ...companyGroup.completed];
      combined.forEach((rfq) => {
        if (isVendorRFQ(rfq, CURRENT_VENDOR_NAME)) {
          rfqMap.set(rfq.id, rfq);
        }
      });
    });

    return Array.from(rfqMap.values());
  }, [syncCount]);

  // Compute summary metrics for Acme Global
  const { newRFQs, expiringSoonRFQs, submittedRFQs, closedRFQs } = useMemo(() => {
    const newItems: RFQRecord[] = [];
    const expiringItems: RFQRecord[] = [];
    const submittedItems: RFQRecord[] = [];
    const closedItems: RFQRecord[] = [];

    allVendorRFQs.forEach((rfq) => {
      const pres = getVendorRFQPresentation(rfq, CURRENT_VENDOR_NAME);
      if (pres.isNew) newItems.push(rfq);
      if (pres.isExpiringSoon) expiringItems.push(rfq);
      if (pres.hasSubmitted) submittedItems.push(rfq);
      if (pres.isClosed) closedItems.push(rfq);
    });

    return {
      newRFQs: newItems,
      expiringSoonRFQs: expiringItems,
      submittedRFQs: submittedItems,
      closedRFQs: closedItems,
    };
  }, [allVendorRFQs]);

  // Filtered RFQs for the "All RFQs" section based on tab and search
  const filteredAllRFQs = useMemo(() => {
    let list = allVendorRFQs;

    if (activeFilterTab === 'new') {
      list = newRFQs;
    } else if (activeFilterTab === 'expiring') {
      list = expiringSoonRFQs;
    } else if (activeFilterTab === 'submitted') {
      list = submittedRFQs;
    } else if (activeFilterTab === 'closed') {
      list = closedRFQs;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => 
        r.rfqNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.company && r.company.toLowerCase().includes(q)) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allVendorRFQs, activeFilterTab, searchQuery, newRFQs, expiringSoonRFQs, submittedRFQs, closedRFQs]);

  // Render an individual RFQ Card
  const renderRFQCard = (rfq: RFQRecord, isHighlightedUrgent = false) => {
    const pres = getVendorRFQPresentation(rfq, CURRENT_VENDOR_NAME);
    const isUrgent = isHighlightedUrgent || pres.isExpiringSoon;

    return (
      <div 
        key={rfq.id} 
        className={`vp-rfq-card-item ${isUrgent ? 'vp-rfq-card-item--urgent' : ''}`}
      >
        <div>
          {/* Card Top Row: Number, Time Remaining, Urgent Flag */}
          <div className="vp-rfq-card-top-row">
            <span className="vp-rfq-num-pill">{rfq.rfqNumber}</span>
            <span 
              className={`vp-time-remaining-pill ${
                isUrgent ? 'vp-time-remaining-pill--urgent' : ''
              }`}
            >
              <Clock size={11} />
              <span>{rfq.timeRemaining}</span>
            </span>
          </div>

          {/* Buyer Company */}
          <div className="vp-rfq-company-name">
            <Building2 size={13} />
            <span>{rfq.company || 'Enterprise Procurement'}</span>
            <span>·</span>
            <span>{rfq.category}</span>
          </div>

          {/* Title */}
          <h3 className="vp-rfq-title-text">{rfq.title}</h3>

          {/* Items summary */}
          <p className="vp-rfq-items-summary">
            {rfq.itemsSummary || 'Standard line items requested'}
          </p>
        </div>

        {/* Metadata Breakdown */}
        <div>
          <div className="vp-rfq-meta-items">
            <div className="vp-rfq-meta-item">
              <Package size={13} />
              <span>Items: <strong>{rfq.itemCount} ({rfq.totalQuantity} Units)</strong></span>
            </div>
            <div className="vp-rfq-meta-item">
              <Calendar size={13} />
              <span>Received: <strong>{rfq.createdDate}</strong></span>
            </div>
            <div className="vp-rfq-meta-item">
              <Clock size={13} />
              <span>Due: <strong>{rfq.deadlineDate}</strong></span>
            </div>
            {pres.quotationValue && (
              <div className="vp-rfq-meta-item">
                <span>Quoted: <strong>₹{pres.quotationValue.toLocaleString('en-IN')}</strong></span>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="vp-rfq-card-footer" style={{ marginTop: '0.85rem' }}>
            <span className={`vp-status-badge ${pres.badgeClass}`}>
              {pres.badgeIcon}
              <span>{pres.vendorStatusLabel}</span>
            </span>

            <Link 
              href={`/vendor-portal/rfq/${rfq.id}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="vp-btn-view-rfq"
              title={`View ${rfq.rfqNumber}`}
            >
              <span>View RFQ</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vp-rfq-inbox-wrapper">
      {/* 1. Page Header */}
      <div className="vp-rfq-header">
        <div className="vp-rfq-header__left">
          <div className="vp-rfq-header__title">
            <span>RFQ</span>
            <span className="vp-rfq-header__badge">Inbox</span>
          </div>
          <p className="vp-rfq-header__sub">
            Review incoming quotation requests and respond before their deadlines.
          </p>
        </div>

        <div className="vp-rfq-header__vendor-pill">
          <span className="vp-rfq-header__vendor-dot" />
          <span className="vp-rfq-header__vendor-name">{CURRENT_VENDOR_NAME}</span>
        </div>
      </div>

      {/* 2. Three Compact Summary Indicators */}
      <div className="vp-summary-grid">
        {/* Card 1: New RFQs */}
        <div className="vp-summary-card vp-summary-card--blue">
          <div className="vp-summary-card__left">
            <span className="vp-summary-card__label">New RFQs</span>
            <span className="vp-summary-card__count">{newRFQs.length}</span>
            <span className="vp-summary-card__sub">Awaiting initial quote</span>
          </div>
          <div className="vp-summary-card__icon-box">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        {/* Card 2: Expiring Soon */}
        <div className="vp-summary-card vp-summary-card--amber">
          <div className="vp-summary-card__left">
            <span className="vp-summary-card__label">Expiring Soon</span>
            <span className="vp-summary-card__count">{expiringSoonRFQs.length}</span>
            <span className="vp-summary-card__sub">Deadline within 24 hours</span>
          </div>
          <div className="vp-summary-card__icon-box">
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Card 3: Submitted */}
        <div className="vp-summary-card vp-summary-card--green">
          <div className="vp-summary-card__left">
            <span className="vp-summary-card__label">Submitted</span>
            <span className="vp-summary-card__count">{submittedRFQs.length}</span>
            <span className="vp-summary-card__sub">Quotations sent to buyers</span>
          </div>
          <div className="vp-summary-card__icon-box">
            <Send size={22} />
          </div>
        </div>
      </div>

      {/* 3. Section: New RFQs */}
      <section className="vp-section-container">
        <div className="vp-section-header">
          <div className="vp-section-title-wrap">
            <h2 className="vp-section-title">New RFQs</h2>
            <span className="vp-section-badge">{newRFQs.length} Requests</span>
          </div>
        </div>

        {newRFQs.length > 0 ? (
          <div className="vp-rfqs-grid">
            {newRFQs.map((rfq) => renderRFQCard(rfq))}
          </div>
        ) : (
          <div className="vp-empty-state">
            <div className="vp-empty-state__icon">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="vp-empty-state__title">No new RFQs</h3>
            <p className="vp-empty-state__desc">
              All incoming RFQ requests have been reviewed or responded to.
            </p>
          </div>
        )}
      </section>

      {/* 4. Section: Expiring Soon */}
      <section className="vp-section-container">
        <div className="vp-section-header">
          <div className="vp-section-title-wrap">
            <h2 className="vp-section-title">Expiring Soon</h2>
            <span className="vp-section-badge vp-section-badge--urgent">
              {expiringSoonRFQs.length} Urgent
            </span>
          </div>
        </div>

        {expiringSoonRFQs.length > 0 ? (
          <div className="vp-rfqs-grid">
            {expiringSoonRFQs.map((rfq) => renderRFQCard(rfq, true))}
          </div>
        ) : (
          <div className="vp-empty-state">
            <div className="vp-empty-state__icon">
              <Clock size={20} />
            </div>
            <h3 className="vp-empty-state__title">No RFQs are approaching their deadline</h3>
            <p className="vp-empty-state__desc">
              There are no pending quotation requests closing within the next 24 hours.
            </p>
          </div>
        )}
      </section>

      {/* 5. Section: All RFQs */}
      <section className="vp-section-container">
        <div className="vp-section-header">
          <div className="vp-section-title-wrap">
            <h2 className="vp-section-title">All RFQs</h2>
            <span className="vp-section-badge">{allVendorRFQs.length} Total</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="vp-filter-bar">
          <div className="vp-filter-tabs">
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`vp-filter-tab ${activeFilterTab === 'all' ? 'vp-filter-tab--active' : ''}`}
            >
              All ({allVendorRFQs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('new')}
              className={`vp-filter-tab ${activeFilterTab === 'new' ? 'vp-filter-tab--active' : ''}`}
            >
              Awaiting Quotation ({newRFQs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('expiring')}
              className={`vp-filter-tab ${activeFilterTab === 'expiring' ? 'vp-filter-tab--active' : ''}`}
            >
              Expiring Soon ({expiringSoonRFQs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('submitted')}
              className={`vp-filter-tab ${activeFilterTab === 'submitted' ? 'vp-filter-tab--active' : ''}`}
            >
              Submitted ({submittedRFQs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('closed')}
              className={`vp-filter-tab ${activeFilterTab === 'closed' ? 'vp-filter-tab--active' : ''}`}
            >
              Closed ({closedRFQs.length})
            </button>
          </div>

          <div className="vp-filter-search-box">
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search RFQs by number or title..."
              className="vp-filter-search-input"
            />
          </div>
        </div>

        {/* List of Filtered RFQs */}
        {filteredAllRFQs.length > 0 ? (
          <div className="vp-rfqs-grid">
            {filteredAllRFQs.map((rfq) => renderRFQCard(rfq))}
          </div>
        ) : (
          <div className="vp-empty-state">
            <div className="vp-empty-state__icon">
              <Layers size={20} />
            </div>
            <h3 className="vp-empty-state__title">No matching RFQs found</h3>
            <p className="vp-empty-state__desc">
              Try adjusting your search term or active filter tab.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
