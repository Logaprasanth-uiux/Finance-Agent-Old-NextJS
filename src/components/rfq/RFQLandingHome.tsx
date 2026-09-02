"use client";
import React, { useState } from 'react';
import type { RFQRecord } from '../../types/rfq';
import { getRFQsForCompany } from '../../data/rfqMockData';
import { formatCurrencyINR } from '../../data/arMockData';
import {
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Package,
  Building2,
  FileCheck,
  Eye,
  ChevronDown,
  Edit3,
  Lock,
} from 'lucide-react';

interface RFQLandingHomeProps {
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  companies: string[];
  onCreateNewRFQ: () => void;
  onViewRFQ: (rfq: RFQRecord) => void;
  onEditDraft: (rfq: RFQRecord) => void;
}

export const RFQLandingHome: React.FC<RFQLandingHomeProps> = ({
  selectedCompany,
  onSelectCompany,
  companies,
  onCreateNewRFQ,
  onViewRFQ,
  onEditDraft,
}) => {
  const [filterTab, setFilterTab] = useState<string>('ALL');

  const { running: runningRFQs, completed: completedRFQs } =
    getRFQsForCompany(selectedCompany);

  const awaitingCount = runningRFQs.filter(
    (r) =>
      r.status === 'Awaiting Quotations' ||
      r.status === 'Sent to Vendors' ||
      (r.quotesReceivedCount === 0 && r.status !== 'Draft')
  ).length;

  const receivedCount = runningRFQs.filter(
    (r) =>
      r.status === 'Quotations Received' ||
      (r.quotesReceivedCount !== undefined && r.quotesReceivedCount > 0)
  ).length;

  const closingCount = runningRFQs.filter(
    (r) => r.isUrgent || r.status === 'Closing Soon'
  ).length;

  const filteredRunningRFQs = runningRFQs.filter((rfq) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'AWAITING') {
      return (
        rfq.status === 'Awaiting Quotations' ||
        rfq.status === 'Sent to Vendors' ||
        (rfq.quotesReceivedCount === 0 && rfq.status !== 'Draft')
      );
    }
    if (filterTab === 'RECEIVED') {
      return (
        rfq.status === 'Quotations Received' ||
        (rfq.quotesReceivedCount !== undefined && rfq.quotesReceivedCount > 0)
      );
    }
    if (filterTab === 'CLOSING') {
      return rfq.isUrgent || rfq.status === 'Closing Soon';
    }
    return true;
  });

  const getStatusBadge = (status: RFQRecord['status']) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--draft">
            <Edit3 size={11} />
            Draft
          </span>
        );
      case 'Closing Soon':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--urgent">
            <AlertTriangle size={12} />
            Closing Soon
          </span>
        );
      case 'Quotations Received':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--success">
            <CheckCircle2 size={12} />
            Quotations Received
          </span>
        );
      case 'Awaiting Quotations':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--awaiting">
            <Clock size={12} />
            Awaiting Quotations
          </span>
        );
      case 'Sent to Vendors':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--sent">
            <Users size={12} />
            Sent to Vendors
          </span>
        );
      case 'Closed':
        return (
          <span className="rfq-landing-badge rfq-landing-badge--closed">
            <FileCheck size={12} />
            Closed / Awarded
          </span>
        );
      default:
        return (
          <span className="rfq-landing-badge rfq-landing-badge--draft">
            {status}
          </span>
        );
    }
  };

  const getTimeRemainingTag = (rfq: RFQRecord) => {
    if (rfq.status === 'Draft') {
      return (
        <span className="rfq-time-pill rfq-time-pill--draft">
          <Edit3 size={11} />
          {rfq.timeRemaining}
        </span>
      );
    }
    if (rfq.isUrgent || rfq.status === 'Closing Soon') {
      return (
        <span className="rfq-time-pill rfq-time-pill--urgent">
          <AlertTriangle size={12} />
          {rfq.timeRemaining}
        </span>
      );
    }
    if (rfq.status === 'Closed') {
      return (
        <span className="rfq-time-pill rfq-time-pill--closed">
          {rfq.timeRemaining}
        </span>
      );
    }
    return (
      <span className="rfq-time-pill">
        <Clock size={12} />
        {rfq.timeRemaining}
      </span>
    );
  };

  const renderCardAction = (rfq: RFQRecord) => {
    // 1. Draft RFQs -> Continue Editing
    if (rfq.status === 'Draft' || (!rfq.isLocked && rfq.status === 'Draft')) {
      return (
        <button
          type="button"
          onClick={() => onEditDraft(rfq)}
          className="rfq-btn rfq-btn--sm rfq-btn--primary rfq-btn--full"
        >
          <Edit3 size={13} />
          <span>Continue Editing</span>
        </button>
      );
    }

    // 2. Quotes Received / Quotations Ready for Review -> View RFQ & Quotations
    const hasQuotes =
      (rfq.quotesReceivedCount || 0) > 0 || rfq.status === 'Quotations Received';

    if (hasQuotes) {
      return (
        <button
          type="button"
          onClick={() => onViewRFQ(rfq)}
          className="rfq-btn rfq-btn--sm rfq-btn--primary rfq-btn--full rfq-btn--glow-subtle"
        >
          <Eye size={13} />
          <span>View RFQ &amp; Quotations</span>
        </button>
      );
    }

    // 3. Awaiting Quotes / Sent to Vendors -> View RFQ (Read-only)
    return (
      <button
        type="button"
        onClick={() => onViewRFQ(rfq)}
        className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--full"
      >
        <Eye size={13} />
        <span>View RFQ</span>
      </button>
    );
  };

  return (
    <div className="rfq-landing-container">
      {/* 1. Header Banner, Company Selector & Quick Create Action */}
      <div className="rfq-landing-header">
        <div className="rfq-landing-header__content">
          <div className="rfq-landing-header__title-row">
            <div>
              <h1 className="rfq-landing-header__title">Request for Quote (RFQ)</h1>
              <p className="rfq-landing-header__sub">
                Create and manage vendor quotation requests, technical specification enrichments, and multi-supplier bid evaluations.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateNewRFQ}
              className="rfq-btn rfq-btn--primary rfq-btn--lg rfq-btn--glow"
            >
              <Plus size={18} />
              <span>Create New RFQ</span>
            </button>
          </div>

          {/* Company Selector - Positioned cleanly in header area */}
          <div className="rfq-company-selector-box">
            <label htmlFor="rfq-company-select" className="rfq-company-select-label">
              <Building2 size={14} className="rfq-icon-indigo" />
              <span>Company</span>
            </label>
            <div className="rfq-company-select-wrapper">
              <select
                id="rfq-company-select"
                value={selectedCompany}
                onChange={(e) => onSelectCompany(e.target.value)}
                className="rfq-company-select"
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="rfq-company-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active / Running RFQs Section */}
      <section className="rfq-landing-section">
        <div className="rfq-landing-section__header">
          <div className="rfq-landing-section__title-group">
            <div className="rfq-section-dot rfq-section-dot--live" />
            <h2 className="rfq-landing-section__title">Active &amp; Running RFQs</h2>
            <span className="rfq-landing-section__count">
              {runningRFQs.length} In Progress
            </span>
          </div>
        </div>

        {/* Primary RFQ Lifecycle Status Navigation Cards */}
        <div className="rfq-status-nav-grid">
          {/* Card 1: All Active */}
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`rfq-status-nav-card ${filterTab === 'ALL' ? 'rfq-status-nav-card--active rfq-status-nav-card--active-indigo' : ''}`}
          >
            <div className="rfq-status-nav-card__top">
              <span className="rfq-status-nav-card__count">{runningRFQs.length}</span>
              <div className="rfq-status-nav-card__icon rfq-status-nav-card__icon--indigo">
                <Package size={17} />
              </div>
            </div>
            <div className="rfq-status-nav-card__name">All Active</div>
            <span className="rfq-status-nav-card__sub">All active workspace RFQs</span>
          </button>

          {/* Card 2: Awaiting Quotes */}
          <button
            type="button"
            onClick={() => setFilterTab('AWAITING')}
            className={`rfq-status-nav-card ${filterTab === 'AWAITING' ? 'rfq-status-nav-card--active rfq-status-nav-card--active-blue' : ''}`}
          >
            <div className="rfq-status-nav-card__top">
              <span className="rfq-status-nav-card__count rfq-color-blue">{awaitingCount}</span>
              <div className="rfq-status-nav-card__icon rfq-status-nav-card__icon--blue">
                <Clock size={17} />
              </div>
            </div>
            <div className="rfq-status-nav-card__name">Awaiting Quotes</div>
            <span className="rfq-status-nav-card__sub">Pending vendor bid submissions</span>
          </button>

          {/* Card 3: Quotes Received */}
          <button
            type="button"
            onClick={() => setFilterTab('RECEIVED')}
            className={`rfq-status-nav-card ${filterTab === 'RECEIVED' ? 'rfq-status-nav-card--active rfq-status-nav-card--active-green' : ''}`}
          >
            <div className="rfq-status-nav-card__top">
              <span className="rfq-status-nav-card__count rfq-color-green">{receivedCount}</span>
              <div className="rfq-status-nav-card__icon rfq-status-nav-card__icon--green">
                <CheckCircle2 size={17} />
              </div>
            </div>
            <div className="rfq-status-nav-card__name">Quotes Received</div>
            <span className="rfq-status-nav-card__sub">Ready for buyer evaluation</span>
          </button>

          {/* Card 4: Closing Soon */}
          <button
            type="button"
            onClick={() => setFilterTab('CLOSING')}
            className={`rfq-status-nav-card ${filterTab === 'CLOSING' ? 'rfq-status-nav-card--active rfq-status-nav-card--active-amber' : ''}`}
          >
            <div className="rfq-status-nav-card__top">
              <span className="rfq-status-nav-card__count rfq-color-amber">{closingCount}</span>
              <div className="rfq-status-nav-card__icon rfq-status-nav-card__icon--amber">
                <AlertTriangle size={17} />
              </div>
            </div>
            <div className="rfq-status-nav-card__name">Closing Soon</div>
            <span className="rfq-status-nav-card__sub">Deadline within 24 hours</span>
          </button>
        </div>

        {/* Running RFQ Cards Grid */}
        <div className="rfq-cards-grid">
          {filteredRunningRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className={`rfq-dashboard-card ${rfq.isUrgent ? 'rfq-dashboard-card--urgent' : ''} ${rfq.status === 'Draft' ? 'rfq-dashboard-card--draft' : ''}`}
            >
              {/* Card Top Row */}
              <div className="rfq-dashboard-card__top">
                <div className="rfq-dashboard-card__num-group">
                  <span className="rfq-dashboard-card__num">{rfq.rfqNumber}</span>
                  <span className="rfq-dashboard-card__category">{rfq.category}</span>
                </div>
                <div className="rfq-dashboard-card__badges">
                  {getStatusBadge(rfq.status)}
                </div>
              </div>

              {/* Title & Items Summary */}
              <div className="rfq-dashboard-card__body">
                <h3 className="rfq-dashboard-card__title">{rfq.title}</h3>
                <div className="rfq-dashboard-card__items-row">
                  <Package size={14} className="rfq-icon-indigo" />
                  <span className="rfq-dashboard-card__items-text">
                    <strong>{rfq.itemsSummary}</strong> · {rfq.totalQuantity} Units
                  </span>
                </div>
              </div>

              {/* Vendors List & Quotes Progress */}
              <div className="rfq-dashboard-card__vendors-zone">
                <div className="rfq-dashboard-card__vendors-header">
                  <div className="rfq-dashboard-card__vendors-count">
                    <Building2 size={13} />
                    <span>
                      {rfq.vendorCount > 0 ? (
                        <>
                          {rfq.vendorCount} Invited Vendors
                          {rfq.quotesReceivedCount !== undefined && (
                            <strong> ({rfq.quotesReceivedCount}/{rfq.vendorCount} Quoted)</strong>
                          )}
                        </>
                      ) : (
                        <span>Vendor selection pending</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="rfq-dashboard-card__vendor-names">
                  {rfq.vendors.length > 0 ? (
                    <>
                      {rfq.vendors.slice(0, 3).map((vendorName, i) => (
                        <span key={i} className="rfq-mini-vendor-pill">
                          {vendorName}
                        </span>
                      ))}
                      {rfq.vendors.length > 3 && (
                        <span className="rfq-mini-vendor-pill rfq-mini-vendor-pill--more">
                          +{rfq.vendors.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="rfq-empty-vendor-note">No vendors assigned yet</span>
                  )}
                </div>
              </div>

              {/* Timeline & Due Date Footer */}
              <div className="rfq-dashboard-card__footer">
                <div className="rfq-dashboard-card__timeline">
                  <span className="rfq-dashboard-card__created">
                    Created: {rfq.createdDate}
                  </span>
                  <span className="rfq-dashboard-card__due">
                    {rfq.status === 'Draft' ? 'Target: ' : 'Closes: '}
                    {rfq.deadlineDate}
                  </span>
                </div>

                <div className="rfq-dashboard-card__time-badge">
                  {getTimeRemainingTag(rfq)}
                </div>
              </div>

              {/* Dynamic State-based Card Actions Row */}
              <div className="rfq-dashboard-card__actions-row">
                {renderCardAction(rfq)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recent / Completed RFQs Section */}
      <section className="rfq-landing-section">
        <div className="rfq-landing-section__header">
          <div className="rfq-landing-section__title-group">
            <h2 className="rfq-landing-section__title">Recent &amp; Completed RFQs</h2>
            <span className="rfq-landing-section__count">
              {completedRFQs.length} Historical
            </span>
          </div>
        </div>

        <div className="rfq-cards-grid rfq-cards-grid--completed">
          {completedRFQs.map((rfq) => (
            <div key={rfq.id} className="rfq-dashboard-card rfq-dashboard-card--completed">
              <div className="rfq-dashboard-card__top">
                <div className="rfq-dashboard-card__num-group">
                  <span className="rfq-dashboard-card__num">{rfq.rfqNumber}</span>
                  <span className="rfq-dashboard-card__category">{rfq.category}</span>
                </div>
                {getStatusBadge(rfq.status)}
              </div>

              <div className="rfq-dashboard-card__body">
                <h3 className="rfq-dashboard-card__title">{rfq.title}</h3>
                <div className="rfq-dashboard-card__items-row">
                  <Package size={14} />
                  <span>{rfq.itemsSummary}</span>
                </div>
              </div>

              <div className="rfq-dashboard-card__footer">
                <div className="rfq-dashboard-card__timeline">
                  <span>Completed: {rfq.deadlineDate}</span>
                  {rfq.estimatedBudget && (
                    <span>Value: {formatCurrencyINR(rfq.estimatedBudget)}</span>
                  )}
                </div>
                {getTimeRemainingTag(rfq)}
              </div>

              <div className="rfq-dashboard-card__actions-row">
                <button
                  type="button"
                  onClick={() => onViewRFQ(rfq)}
                  className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--full"
                >
                  <Eye size={13} />
                  <span>View RFQ &amp; Historical Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RFQLandingHome;


