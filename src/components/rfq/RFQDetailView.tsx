"use client";
import React, { useState } from 'react';
import type { RFQRecord, VendorQuotation, VendorResponse } from '../../types/rfq';
import VendorQuotationModal from './VendorQuotationModal';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Lock,
  Package,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Users,
  X,
} from 'lucide-react';

interface RFQDetailViewProps {
  rfq: RFQRecord;
  onBackToHub: () => void;
  onViewQuotation?: (quotation: VendorQuotation) => void;
}

export const RFQDetailView: React.FC<RFQDetailViewProps> = ({
  rfq,
  onBackToHub,
  onViewQuotation,
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'scope'>('quotes');
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0);
  
  // Local state for vendor responses to enable interactive quotation approval
  const [vendorResponses, setVendorResponses] = useState<VendorResponse[]>(
    rfq.vendorResponses || []
  );
  
  // Confirmation Modal State for approving a quotation
  const [confirmApproveTarget, setConfirmApproveTarget] =
    useState<VendorResponse | null>(null);

  // Active Quotation Modal state (shared state between cards and modal)
  const [activeModalQuotation, setActiveModalQuotation] =
    useState<VendorQuotation | null>(null);

  const getStatusBadge = (status: RFQRecord['status']) => {
    switch (status) {
      case 'Quotations Received':
        return <span className="rfq-badge rfq-badge--green">Quotations Received</span>;
      case 'Awaiting Quotations':
        return <span className="rfq-badge rfq-badge--blue">Awaiting Quotations</span>;
      case 'Closing Soon':
        return <span className="rfq-badge rfq-badge--amber">Closing Soon</span>;
      case 'Closed':
        return <span className="rfq-badge rfq-badge--gray">Closed / Awarded</span>;
      case 'Sent to Vendors':
      default:
        return <span className="rfq-badge rfq-badge--indigo">{status}</span>;
    }
  };

  const invitedCount = rfq.vendorCount || vendorResponses.length;
  const quotesReceivedCount = vendorResponses.filter(
    (v) => v.status === 'Quotation Received' || v.status === 'Quotation Approved'
  ).length;
  const quotesApprovedCount = vendorResponses.filter(
    (v) => v.status === 'Quotation Approved'
  ).length;
  const awaitingResponseCount = vendorResponses.filter(
    (v) => v.status === 'Awaiting Response'
  ).length;

  const handleExecuteApproval = () => {
    if (!confirmApproveTarget) return;

    setVendorResponses((prev) =>
      prev.map((resp) => {
        if (resp.vendorId === confirmApproveTarget.vendorId) {
          return {
            ...resp,
            status: 'Quotation Approved',
            approvedDate: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
        }
        return resp;
      })
    );

    setConfirmApproveTarget(null);
  };

  const handleOpenQuotation = (quotation: VendorQuotation) => {
    setActiveModalQuotation(quotation);
    if (onViewQuotation) {
      onViewQuotation(quotation);
    }
  };

  // Check if current modal vendor is approved
  const currentModalVendor = activeModalQuotation
    ? vendorResponses.find(
        (v) =>
          v.quotation?.quotationNumber === activeModalQuotation.quotationNumber ||
          v.vendorName === activeModalQuotation.vendorName
      )
    : null;
  const isCurrentModalApproved =
    currentModalVendor?.status === 'Quotation Approved';

  return (
    <div className="rfq-detail-container">
      {/* Top Breadcrumb & Action Bar */}
      <div className="rfq-detail-top-nav">
        <button
          type="button"
          onClick={onBackToHub}
          className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-back-btn"
        >
          <ArrowLeft size={15} />
          <span>Back to RFQ Hub</span>
        </button>

        <div className="rfq-detail-header-status">
          {getStatusBadge(rfq.status)}
          {rfq.isUrgent && (
            <span className="rfq-badge rfq-badge--urgent">Closing in &lt; 24h</span>
          )}
        </div>
      </div>

      {/* Main RFQ Header Card */}
      <div className="rfq-detail-header-card">
        <div className="rfq-detail-header-card__top">
          <div>
            <div className="rfq-detail-num-row">
              <span className="rfq-detail-num">{rfq.rfqNumber}</span>
              <span className="rfq-detail-cat-tag">{rfq.category}</span>
            </div>
            <h1 className="rfq-detail-title">{rfq.title}</h1>
          </div>
        </div>

        {/* Company & Procurement Metadata Grid */}
        <div className="rfq-detail-meta-grid">
          <div className="rfq-detail-meta-item">
            <Building2 size={15} className="rfq-icon-indigo" />
            <div>
              <span className="rfq-detail-meta-label">Issuing Legal Entity</span>
              <span className="rfq-detail-meta-value">{rfq.company || 'Acme Technologies Pvt Ltd'}</span>
            </div>
          </div>

          <div className="rfq-detail-meta-item">
            <Calendar size={15} className="rfq-icon-indigo" />
            <div>
              <span className="rfq-detail-meta-label">Created Date</span>
              <span className="rfq-detail-meta-value">{rfq.createdDate}</span>
            </div>
          </div>

          <div className="rfq-detail-meta-item">
            <Clock size={15} className="rfq-icon-indigo" />
            <div>
              <span className="rfq-detail-meta-label">Closing Deadline</span>
              <span className="rfq-detail-meta-value">{rfq.deadlineDate} ({rfq.timeRemaining})</span>
            </div>
          </div>

          <div className="rfq-detail-meta-item">
            <MapPin size={15} className="rfq-icon-indigo" />
            <div>
              <span className="rfq-detail-meta-label">Delivery Location</span>
              <span className="rfq-detail-meta-value">
                {rfq.deliveryLocation || 'DataTwin Corporate HQ — Bangalore Tech Park'}
              </span>
            </div>
          </div>
        </div>

        {/* Locked State Banner */}
        <div className="rfq-locked-notice-banner">
          <div className="rfq-locked-notice-banner__left">
            <div className="rfq-locked-icon-wrap">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="rfq-locked-title">🔒 RFQ Locked — Sent to Vendors</h4>
              <p className="rfq-locked-desc">
                This RFQ has been officially dispatched to suppliers. In accordance with procurement governance, original specifications, requested quantities, and commercial terms are immutable.
              </p>
            </div>
          </div>
          <span className="rfq-locked-badge">Read-Only View</span>
        </div>
      </div>

      {/* Tabs Switcher: Vendor Responses vs Original Scope */}
      <div className="rfq-detail-tabs">
        <button
          type="button"
          className={`rfq-detail-tab ${activeTab === 'quotes' ? 'rfq-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          <FileText size={16} />
          <span>
            Vendor Responses ({quotesReceivedCount}/{invitedCount} Received)
          </span>
        </button>

        <button
          type="button"
          className={`rfq-detail-tab ${activeTab === 'scope' ? 'rfq-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('scope')}
        >
          <Package size={16} />
          <span>
            Requested Scope &amp; Specifications ({rfq.itemCount} Item{rfq.itemCount > 1 ? 's' : ''})
          </span>
        </button>
      </div>

      {/* Tab 1: Vendor Responses with Individual Approval Capabilities */}
      {activeTab === 'quotes' && (
        <div className="rfq-detail-section">
          <div className="rfq-vendor-responses-header">
            <div>
              <h3 className="rfq-section-title">Vendor Responses</h3>
              <p className="rfq-section-sub">
                Review submitted quotations from invited vendors and independently approve qualifying commercial proposals.
              </p>
            </div>

            {/* Structured Stage Metric Badges */}
            <div className="rfq-response-summary-badges">
              <span className="rfq-summary-chip rfq-summary-chip--invited">
                <Users size={13} />
                <strong>{invitedCount}</strong> Vendors Invited
              </span>
              <span className="rfq-summary-chip rfq-summary-chip--received">
                <CheckCircle2 size={13} />
                <strong>{quotesReceivedCount}</strong> Quotations Received
              </span>
              <span
                className={`rfq-summary-chip ${
                  quotesApprovedCount > 0
                    ? 'rfq-summary-chip--approved'
                    : 'rfq-summary-chip--neutral'
                }`}
              >
                <ShieldCheck size={13} />
                <strong>{quotesApprovedCount}</strong> Quotation{quotesApprovedCount === 1 ? '' : 's'} Approved
              </span>
              <span className="rfq-summary-chip rfq-summary-chip--awaiting">
                <Clock size={13} />
                <strong>{awaitingResponseCount}</strong> Awaiting Response
              </span>
            </div>
          </div>

          {/* Special Banner for Historical RFQ with No Quotations Received */}
          {quotesReceivedCount === 0 && (
            <div className="rfq-empty-historical-notice">
              <AlertCircle size={18} className="rfq-icon-amber" />
              <div>
                <strong>No Vendor Quotations Received</strong>
                <p>
                  This procurement cycle concluded without any supplier quotation submissions prior to the bidding deadline. Original RFQ specifications and invited vendor logs are archived below for compliance.
                </p>
              </div>
            </div>
          )}

          <div className="rfq-vendor-responses-grid">
            {vendorResponses.length > 0 ? (
              vendorResponses.map((resp, idx) => {
                const isApproved = resp.status === 'Quotation Approved';
                const isReceived = resp.status === 'Quotation Received' || isApproved;

                return (
                  <div
                    key={resp.vendorId || idx}
                    className={`rfq-vendor-response-card ${
                      isApproved
                        ? 'rfq-vendor-response-card--approved'
                        : isReceived
                        ? 'rfq-vendor-response-card--received'
                        : 'rfq-vendor-response-card--pending'
                    }`}
                  >
                    <div className="rfq-vendor-response-card__top">
                      <div className="rfq-vendor-response-card__vendor-info">
                        <div
                          className="rfq-vendor-response-avatar"
                          style={{
                            backgroundColor: isApproved
                              ? '#059669'
                              : isReceived
                              ? '#4F46E5'
                              : '#94A3B8',
                          }}
                        >
                          {resp.vendorName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="rfq-vendor-response-name">{resp.vendorName}</h4>
                          <span className="rfq-vendor-response-sub">
                            {isReceived
                              ? `Quotation: ${resp.quotation?.quotationNumber || 'QTN-2026'}`
                              : 'Invited Supplier'}
                          </span>
                        </div>
                      </div>

                      <div className="rfq-vendor-response-card__status">
                        {isApproved ? (
                          <span className="rfq-resp-pill rfq-resp-pill--approved">
                            <ShieldCheck size={12} />
                            Quotation Approved
                          </span>
                        ) : isReceived ? (
                          <span className="rfq-resp-pill rfq-resp-pill--received">
                            <CheckCircle2 size={12} />
                            Quotation Received
                          </span>
                        ) : (
                          <span className="rfq-resp-pill rfq-resp-pill--pending">
                            <Clock size={12} />
                            Awaiting Response
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rfq-vendor-response-card__body">
                      {isReceived ? (
                        <div className="rfq-vendor-response-received-info">
                          <div className="rfq-vendor-response-value-row">
                            <span className="rfq-vendor-response-label">Total Quotation</span>
                            <span className="rfq-vendor-response-value">
                              ₹{resp.quotationValue ? resp.quotationValue.toLocaleString('en-IN') : resp.quotation?.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="rfq-vendor-response-compact-specs">
                            <div className="rfq-vendor-response-spec-item">
                              <span className="rfq-spec-k">Delivery:</span>
                              <span className="rfq-spec-v">{resp.quotation?.deliveryTimeline || '5-7 Days'}</span>
                            </div>
                            <div className="rfq-vendor-response-spec-item">
                              <span className="rfq-spec-k">Payment:</span>
                              <span className="rfq-spec-v">{resp.quotation?.paymentTerms || 'Net 30'}</span>
                            </div>
                          </div>

                          <div className="rfq-vendor-response-meta-row">
                            <span className="rfq-vendor-response-meta-text">
                              Submitted: <strong>{resp.submittedDate}</strong> {resp.submittedTime && `at ${resp.submittedTime}`}
                            </span>
                          </div>

                          {isApproved && (
                            <div className="rfq-vendor-approved-tag">
                              <CheckCircle2 size={12} />
                              <span>Approved by Buyer{resp.approvedDate ? ` on ${resp.approvedDate}` : ''}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rfq-vendor-response-pending-info">
                          <div className="rfq-vendor-response-meta-row">
                            <span className="rfq-vendor-response-meta-text">
                              RFQ Sent: <strong>{resp.sentDate || rfq.createdDate}</strong>
                            </span>
                          </div>
                          <div className="rfq-vendor-response-meta-row">
                            <span className="rfq-vendor-response-meta-text">
                              Response Deadline: <strong>{resp.responseDeadline || rfq.deadlineDate}</strong>
                            </span>
                          </div>
                          <p className="rfq-vendor-response-pending-note">
                            No quotation was submitted by this vendor.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="rfq-vendor-response-card__footer">
                      {isApproved ? (
                        <div className="rfq-response-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenQuotation(resp.quotation!)}
                            className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--flex"
                          >
                            <Eye size={13} />
                            <span>View Quotation</span>
                          </button>
                          <span className="rfq-approved-pill-action">
                            <CheckCircle2 size={13} />
                            <span>Approved</span>
                          </span>
                        </div>
                      ) : isReceived && resp.quotation ? (
                        <div className="rfq-response-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenQuotation(resp.quotation!)}
                            className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--flex"
                          >
                            <Eye size={13} />
                            <span>View Quotation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmApproveTarget(resp)}
                            className="rfq-btn rfq-btn--sm rfq-btn--primary rfq-btn--approve rfq-btn--flex"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve Quotation</span>
                          </button>
                        </div>
                      ) : (
                        <div className="rfq-no-quote-pill">
                          <Clock size={12} />
                          <span>No Quotation Submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rfq-empty-responses-box">
                <AlertCircle size={24} className="rfq-icon-indigo" />
                <h4>No Vendor Submissions</h4>
                <p>
                  RFQ was issued to {rfq.vendorCount} suppliers. No quotations were recorded for this procurement cycle.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quotation Detail Modal with Shared Approval State & In-Modal Approval */}
      <VendorQuotationModal
        isOpen={!!activeModalQuotation}
        quotation={activeModalQuotation}
        isApproved={isCurrentModalApproved}
        onApprove={() => currentModalVendor && setConfirmApproveTarget(currentModalVendor)}
        onClose={() => setActiveModalQuotation(null)}
      />

      {/* Lightweight Quotation Approval Confirmation Modal */}
      {confirmApproveTarget && (
        <div
          className="rfq-modal-backdrop"
          onClick={() => setConfirmApproveTarget(null)}
        >
          <div
            className="rfq-modal-card rfq-modal-card--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rfq-modal-header">
              <div className="rfq-modal-header-icon rfq-modal-header-icon--green">
                <ShieldCheck size={20} />
              </div>
              <div className="rfq-modal-header-text">
                <h3 className="rfq-modal-title">Approve Quotation</h3>
                <p className="rfq-modal-sub">Commercial Proposal Evaluation</p>
              </div>
              <button
                className="rfq-modal-close-btn"
                onClick={() => setConfirmApproveTarget(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rfq-modal-body">
              <div className="rfq-confirm-details-box">
                <div className="rfq-confirm-row">
                  <span className="rfq-confirm-label">Vendor:</span>
                  <strong className="rfq-confirm-value">{confirmApproveTarget.vendorName}</strong>
                </div>
                <div className="rfq-confirm-row">
                  <span className="rfq-confirm-label">Quotation:</span>
                  <code className="rfq-code-tag">{confirmApproveTarget.quotation?.quotationNumber || 'QTN-2026'}</code>
                </div>
                <div className="rfq-confirm-row">
                  <span className="rfq-confirm-label">Total Amount:</span>
                  <strong className="rfq-confirm-value rfq-confirm-value--price">
                    ₹{confirmApproveTarget.quotation?.totalAmount.toLocaleString('en-IN') || confirmApproveTarget.quotationValue?.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <p className="rfq-confirm-notice">
                Approving this quotation marks it as evaluated and approved by the buyer for this procurement cycle. Multiple supplier quotations can be approved independently.
              </p>
            </div>

            <div className="rfq-modal-footer">
              <button
                type="button"
                className="rfq-btn rfq-btn--secondary"
                onClick={() => setConfirmApproveTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rfq-btn rfq-btn--primary rfq-btn--approve-btn"
                onClick={handleExecuteApproval}
              >
                <CheckCircle2 size={14} />
                <span>Approve Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Requested Scope & Specifications (Read-Only) */}
      {activeTab === 'scope' && (
        <div className="rfq-detail-section">
          <div className="rfq-detail-scope-grid">
            {/* Left: Line Items with Specs */}
            <div className="rfq-detail-scope-main">
              <div className="rfq-detail-card">
                <div className="rfq-detail-card__header">
                  <h3 className="rfq-detail-card__title">
                    <Package size={17} className="rfq-icon-indigo" />
                    <span>Requested Line Items ({rfq.itemCount})</span>
                  </h3>
                  <span className="rfq-pill-subtle">{rfq.totalQuantity} Total Units</span>
                </div>

                <div className="rfq-detail-items-list">
                  {rfq.itemsDetail && rfq.itemsDetail.length > 0 ? (
                    rfq.itemsDetail.map((itemSel, idx) => {
                      const isExpanded = expandedItemIndex === idx;

                      return (
                        <div key={itemSel.item.id || idx} className="rfq-detail-item-card">
                          <div
                            className="rfq-detail-item-card__header"
                            onClick={() => setExpandedItemIndex(isExpanded ? null : idx)}
                          >
                            <div className="rfq-detail-item-card__left">
                              <span className="rfq-detail-item-num">{idx + 1}</span>
                              <div>
                                <h4 className="rfq-detail-item-name">{itemSel.item.name}</h4>
                                <div className="rfq-detail-item-pills">
                                  <span className="rfq-code-tag">SKU: {itemSel.item.model}</span>
                                  <span className="rfq-cat-tag">{itemSel.item.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="rfq-detail-item-card__right">
                              <span className="rfq-detail-qty-badge">
                                <strong>{itemSel.quantity}</strong> {itemSel.item.unit}
                              </span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="rfq-detail-item-card__body">
                              <h5 className="rfq-detail-specs-heading">Technical Specifications</h5>
                              <div className="rfq-detail-specs-table-wrap">
                                <table className="rfq-detail-specs-table">
                                  <thead>
                                    <tr>
                                      <th>Parameter</th>
                                      <th>Specification Value</th>
                                      <th>Source</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {itemSel.specifications.map((spec) => (
                                      <tr key={spec.id}>
                                        <td><strong>{spec.key}</strong></td>
                                        <td>{spec.value}</td>
                                        <td>
                                          <span className={`rfq-spec-source-tag rfq-spec-source-tag--${spec.source}`}>
                                            {spec.source === 'ai-suggested' ? 'AI Enhanced' : spec.source === 'item-master' ? 'Item Master' : 'Custom'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rfq-detail-fallback-item">
                      <div className="rfq-detail-fallback-summary">
                        <strong>{rfq.itemsSummary}</strong>
                        <span>Total Quantity: {rfq.totalQuantity} Units</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Procurement Notes & Invited Vendors Summary */}
            <div className="rfq-detail-scope-sidebar">
              <div className="rfq-detail-card">
                <h4 className="rfq-detail-card__title">
                  <FileText size={16} className="rfq-icon-indigo" />
                  <span>Buyer Procurement Instructions</span>
                </h4>
                <div className="rfq-detail-notes-box">
                  <p>
                    {rfq.notes ||
                      'Please include standard enterprise warranty, GST breakout, and volume discounting in commercial quotation.'}
                  </p>
                </div>
              </div>

              <div className="rfq-detail-card">
                <h4 className="rfq-detail-card__title">
                  <Users size={16} className="rfq-icon-indigo" />
                  <span>Invited Suppliers ({rfq.vendorCount})</span>
                </h4>
                <div className="rfq-detail-vendors-list">
                  {rfq.vendors.map((vName, idx) => (
                    <div key={idx} className="rfq-detail-vendor-row">
                      <Building2 size={13} className="rfq-icon-indigo" />
                      <span>{vName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQDetailView;
