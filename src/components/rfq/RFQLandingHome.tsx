"use client";
import React, { useState } from 'react';
import type { RFQRecord } from '../../types/rfq';
import { mockRunningRFQs, mockRecentCompletedRFQs } from '../../data/rfqMockData';
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
} from 'lucide-react';

interface RFQLandingHomeProps {
  onCreateNewRFQ: () => void;
}

export const RFQLandingHome: React.FC<RFQLandingHomeProps> = ({
  onCreateNewRFQ,
}) => {
  const [filterTab, setFilterTab] = useState<string>('ALL');

  const filteredRunningRFQs = mockRunningRFQs.filter((rfq) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'AWAITING') return rfq.status === 'Awaiting Quotations';
    if (filterTab === 'RECEIVED') return rfq.status === 'Quotations Received';
    if (filterTab === 'CLOSING') return rfq.status === 'Closing Soon';
    return true;
  });

  const getStatusBadge = (status: RFQRecord['status']) => {
    switch (status) {
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
            Draft
          </span>
        );
    }
  };

  const getTimeRemainingTag = (rfq: RFQRecord) => {
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

  return (
    <div className="rfq-landing-container">
      {/* 1. Header Banner & Quick Create Action */}
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

          {/* Quick Metrics Bar */}
          <div className="rfq-landing-stats">
            <div className="rfq-stat-card">
              <div className="rfq-stat-card__num">{mockRunningRFQs.length}</div>
              <div className="rfq-stat-card__label">Active RFQs</div>
            </div>
            <div className="rfq-stat-card">
              <div className="rfq-stat-card__num rfq-color-blue">
                {mockRunningRFQs.filter((r) => r.status === 'Awaiting Quotations').length}
              </div>
              <div className="rfq-stat-card__label">Awaiting Bids</div>
            </div>
            <div className="rfq-stat-card">
              <div className="rfq-stat-card__num rfq-color-green">
                {mockRunningRFQs.filter((r) => r.status === 'Quotations Received').length}
              </div>
              <div className="rfq-stat-card__label">Quotes Ready for Review</div>
            </div>
            <div className="rfq-stat-card">
              <div className="rfq-stat-card__num rfq-color-amber">
                {mockRunningRFQs.filter((r) => r.isUrgent || r.status === 'Closing Soon').length}
              </div>
              <div className="rfq-stat-card__label">Closing Soon (&lt; 24h)</div>
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
              {mockRunningRFQs.length} In Progress
            </span>
          </div>

          {/* Filter Pills */}
          <div className="rfq-landing-filters">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`rfq-filter-pill ${filterTab === 'ALL' ? 'rfq-filter-pill--active' : ''}`}
            >
              All Active ({mockRunningRFQs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('AWAITING')}
              className={`rfq-filter-pill ${filterTab === 'AWAITING' ? 'rfq-filter-pill--active' : ''}`}
            >
              Awaiting Quotes (2)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('RECEIVED')}
              className={`rfq-filter-pill ${filterTab === 'RECEIVED' ? 'rfq-filter-pill--active' : ''}`}
            >
              Quotes Received (1)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('CLOSING')}
              className={`rfq-filter-pill ${filterTab === 'CLOSING' ? 'rfq-filter-pill--active' : ''}`}
            >
              Closing Soon (1)
            </button>
          </div>
        </div>

        {/* Running RFQ Cards Grid */}
        <div className="rfq-cards-grid">
          {filteredRunningRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className={`rfq-dashboard-card ${rfq.isUrgent ? 'rfq-dashboard-card--urgent' : ''}`}
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
                      {rfq.vendorCount} Invited Vendors
                      {rfq.quotesReceivedCount !== undefined && (
                        <strong> ({rfq.quotesReceivedCount}/{rfq.vendorCount} Quoted)</strong>
                      )}
                    </span>
                  </div>
                </div>

                <div className="rfq-dashboard-card__vendor-names">
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
                </div>
              </div>

              {/* Timeline & Due Date Footer */}
              <div className="rfq-dashboard-card__footer">
                <div className="rfq-dashboard-card__timeline">
                  <span className="rfq-dashboard-card__created">
                    Created: {rfq.createdDate}
                  </span>
                  <span className="rfq-dashboard-card__due">
                    Closes: {rfq.deadlineDate}
                  </span>
                </div>

                <div className="rfq-dashboard-card__time-badge">
                  {getTimeRemainingTag(rfq)}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="rfq-dashboard-card__actions-row">
                <button
                  type="button"
                  onClick={onCreateNewRFQ}
                  className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--full"
                >
                  <Eye size={13} />
                  <span>View Details &amp; Specifications</span>
                </button>
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
              {mockRecentCompletedRFQs.length} Historical
            </span>
          </div>
        </div>

        <div className="rfq-cards-grid rfq-cards-grid--completed">
          {mockRecentCompletedRFQs.map((rfq) => (
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RFQLandingHome;

