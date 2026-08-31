"use client";
import React, { useState } from 'react';
import type {
  RFQItemSelection,
  Vendor,
  RFQSubmissionResult,
} from '../../types/rfq';
import {
  Send,
  CheckCircle2,
  Package,
  Building2,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface RFQReviewStepProps {
  selectedItems: RFQItemSelection[];
  selectedVendors: Vendor[];
  onReset: () => void;
  onSendSuccess?: (result: RFQSubmissionResult) => void;
  isSubmitting?: boolean;
  submissionResult?: RFQSubmissionResult | null;
  quoteDueDate: string;
  setQuoteDueDate: (date: string) => void;
  deliveryLocation: string;
  setDeliveryLocation: (loc: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  handleSendRFQ: () => void;
}

export const RFQReviewStep: React.FC<RFQReviewStepProps> = ({
  selectedItems,
  selectedVendors,
  onReset,
  isSubmitting = false,
  submissionResult,
  quoteDueDate,
  setQuoteDueDate,
  deliveryLocation,
  setDeliveryLocation,
  notes,
  setNotes,
  handleSendRFQ,
}) => {
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0);

  // Success State View after Sending
  if (submissionResult) {
    return (
      <div className="rfq-step-layout">
        {/* Success Banner */}
        <div className="rfq-success-banner">
          <div className="rfq-success-banner__icon">
            <CheckCircle2 size={32} />
          </div>
          <div className="rfq-success-banner__text">
            <div className="rfq-success-banner__badge">
              Official Dispatch Complete
            </div>
            <h2 className="rfq-success-banner__title">
              {submissionResult.rfqNumber} Sent Successfully!
            </h2>
            <p className="rfq-success-banner__desc">
              Request for quotation has been dispatched to <strong>{submissionResult.vendors.length} qualified suppliers</strong>. Automated email notifications and digital quotation submission links have been issued.
            </p>
          </div>
        </div>

        {/* Real-time Vendor Status Tracker Cards */}
        <div className="rfq-review-section-card">
          <div className="rfq-review-section-card__header">
            <h3 className="rfq-review-section-card__title">
              <Building2 size={18} className="rfq-icon-indigo" />
              <span>Supplier Quotation Tracking ({submissionResult.vendors.length} Vendors)</span>
            </h3>
            <span className="rfq-pill-live">● Live Tracking</span>
          </div>

          <div className="rfq-submission-vendor-grid">
            {submissionResult.vendors.map((vendor) => (
              <div key={vendor.id} className="rfq-submission-vendor-card">
                <div className="rfq-submission-vendor-card__top">
                  <div
                    className="rfq-submission-vendor-avatar"
                    style={{ backgroundColor: vendor.logoColor || '#4F46E5' }}
                  >
                    {vendor.logoInitial || vendor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="rfq-submission-vendor-card__info">
                    <h4 className="rfq-submission-vendor-card__name">
                      {vendor.name}
                    </h4>
                    <span className="rfq-submission-vendor-card__email">
                      {vendor.email}
                    </span>
                  </div>
                  <span className="rfq-status-badge rfq-status-badge--sent">
                    <Clock size={11} />
                    Sent · Awaiting Response
                  </span>
                </div>

                <div className="rfq-submission-vendor-card__meta">
                  <div className="rfq-submission-vendor-stat">
                    <span>Dispatched:</span>
                    <strong>{submissionResult.createdDate}</strong>
                  </div>
                  <div className="rfq-submission-vendor-stat">
                    <span>Due Date:</span>
                    <strong>{submissionResult.quoteDueDate}</strong>
                  </div>
                  <div className="rfq-submission-vendor-stat">
                    <span>Target Lead Time:</span>
                    <strong>{vendor.leadTime}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Recap */}
        <div className="rfq-review-section-card">
          <div className="rfq-review-section-card__header">
            <h3 className="rfq-review-section-card__title">
              <Package size={18} className="rfq-icon-indigo" />
              <span>Enriched Scope &amp; Item Specifications</span>
            </h3>
            <span className="rfq-review-meta-tag">
              {submissionResult.items.length} Product Line Items
            </span>
          </div>

          <div className="rfq-review-items-list">
            {submissionResult.items.map((itemSel) => {
              const aiCount = itemSel.specifications.filter(
                (s) => s.source === 'ai-suggested'
              ).length;
              const masterCount = itemSel.specifications.filter(
                (s) => s.source === 'item-master'
              ).length;

              return (
                <div key={itemSel.item.id} className="rfq-review-item-summary">
                  <div className="rfq-review-item-summary__top">
                    <div>
                      <h4 className="rfq-review-item-summary__name">
                        {itemSel.item.name}
                      </h4>
                      <div className="rfq-review-item-summary__pills">
                        <span className="rfq-pill-subtle">
                          Model: {itemSel.item.model}
                        </span>
                        <span className="rfq-pill-subtle">
                          Quantity: <strong>{itemSel.quantity} {itemSel.item.unit}</strong>
                        </span>
                        <span className="rfq-pill-source rfq-pill-source--master">
                          {masterCount} Item Master
                        </span>
                        {aiCount > 0 && (
                          <span className="rfq-pill-source rfq-pill-source--ai">
                            ✨ {aiCount} AI Enriched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="rfq-success-actions">
          <button
            type="button"
            onClick={onReset}
            className="rfq-btn rfq-btn--primary rfq-btn--lg"
          >
            <PlusCircle size={16} />
            <span>Return to RFQ Hub &amp; Manage Quotations</span>
          </button>
        </div>
      </div>
    );
  }

  // Pre-submission Review View
  return (
    <div className="rfq-step-layout">
      <div className="rfq-review-grid">
        {/* Left Column: Scope & Specifications Summary */}
        <div className="rfq-review-main-pane">
          {/* Items & Specs Breakdown */}
          <div className="rfq-review-section-card">
            <div className="rfq-review-section-card__header">
              <h3 className="rfq-review-section-card__title">
                <Package size={18} className="rfq-icon-indigo" />
                <span>Scope of Requested Items ({selectedItems.length})</span>
              </h3>
              <span className="rfq-review-meta-tag">
                {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} Total Units
              </span>
            </div>

            <div className="rfq-review-items-list">
              {selectedItems.map((sel, idx) => {
                const isExpanded = expandedItemIndex === idx;
                const aiSpecs = sel.specifications.filter(
                  (s) => s.source === 'ai-suggested'
                );
                const masterSpecs = sel.specifications.filter(
                  (s) => s.source === 'item-master'
                );
                const customSpecs = sel.specifications.filter(
                  (s) => s.source === 'custom'
                );

                return (
                  <div key={sel.item.id} className="rfq-review-item-card">
                    <div
                      className="rfq-review-item-card__header"
                      onClick={() =>
                        setExpandedItemIndex(isExpanded ? null : idx)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div className="rfq-review-item-card__left">
                        <div className="rfq-review-item-num">{idx + 1}</div>
                        <div>
                          <div className="rfq-review-item-model-row">
                            <span className="rfq-review-item-model">
                              {sel.item.model}
                            </span>
                            <span className="rfq-review-item-cat">
                              {sel.item.category}
                            </span>
                          </div>
                          <h4 className="rfq-review-item-title">
                            {sel.item.name}
                          </h4>
                        </div>
                      </div>

                      <div className="rfq-review-item-card__right">
                        <div className="rfq-review-item-qty-tag">
                          Qty: <strong>{sel.quantity} {sel.item.unit}</strong>
                        </div>
                        <div className="rfq-review-item-specs-badges">
                          <span className="rfq-pill-source rfq-pill-source--master">
                            {masterSpecs.length} Master
                          </span>
                          {aiSpecs.length > 0 && (
                            <span className="rfq-pill-source rfq-pill-source--ai">
                              ✨ {aiSpecs.length} AI Enriched
                            </span>
                          )}
                          {customSpecs.length > 0 && (
                            <span className="rfq-pill-source rfq-pill-source--custom">
                              {customSpecs.length} Custom
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="rfq-review-expand-btn"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="rfq-review-item-card__body">
                        <div className="rfq-review-specs-grid">
                          {sel.specifications.map((spec) => (
                            <div
                              key={spec.id}
                              className={`rfq-review-spec-chip ${
                                spec.source === 'ai-suggested'
                                  ? 'rfq-review-spec-chip--ai'
                                  : spec.source === 'custom'
                                  ? 'rfq-review-spec-chip--custom'
                                  : 'rfq-review-spec-chip--master'
                              }`}
                            >
                              <div className="rfq-review-spec-chip__top">
                                <span className="rfq-review-spec-chip__key">
                                  {spec.key}
                                </span>
                                <span className="rfq-review-spec-chip__source">
                                  {spec.source === 'ai-suggested'
                                    ? '✨ AI Enriched'
                                    : spec.source === 'custom'
                                    ? 'Custom'
                                    : 'Item Master'}
                                </span>
                              </div>
                              <span className="rfq-review-spec-chip__val">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vendors Summary */}
          <div className="rfq-review-section-card">
            <div className="rfq-review-section-card__header">
              <h3 className="rfq-review-section-card__title">
                <Building2 size={18} className="rfq-icon-indigo" />
                <span>Recipient Suppliers ({selectedVendors.length})</span>
              </h3>
              <span className="rfq-review-meta-tag">All Verified Master Vendors</span>
            </div>

            <div className="rfq-review-vendors-grid">
              {selectedVendors.map((vendor) => (
                <div key={vendor.id} className="rfq-review-vendor-pill">
                  <div
                    className="rfq-review-vendor-pill__avatar"
                    style={{ backgroundColor: vendor.logoColor || '#4F46E5' }}
                  >
                    {vendor.logoInitial || vendor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="rfq-review-vendor-pill__info">
                    <h5 className="rfq-review-vendor-pill__name">{vendor.name}</h5>
                    <div className="rfq-review-vendor-pill__meta">
                      <span>{vendor.location}</span>
                      <span>·</span>
                      <span>Lead Time: {vendor.leadTime}</span>
                    </div>
                  </div>
                  <span className="rfq-review-vendor-badge">
                    <ShieldCheck size={11} />
                    {vendor.relationshipStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Final Dispatch Button */}
        <div className="rfq-review-sidebar-pane">
          <div className="rfq-review-section-card rfq-review-section-card--sidebar">
            <h3 className="rfq-review-sidebar-title">Procurement Parameters</h3>

            <div className="rfq-form-group">
              <label className="rfq-form-label">
                <Calendar size={14} />
                <span>Quotation Submission Due Date</span>
              </label>
              <input
                type="date"
                value={quoteDueDate}
                onChange={(e) => setQuoteDueDate(e.target.value)}
                className="rfq-input"
              />
            </div>

            <div className="rfq-form-group">
              <label className="rfq-form-label">
                <MapPin size={14} />
                <span>Delivery Destination</span>
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="rfq-input"
              />
            </div>

            <div className="rfq-form-group">
              <label className="rfq-form-label">
                <FileText size={14} />
                <span>Commercial Terms & Notes for Vendors</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rfq-textarea"
              />
            </div>

            {/* Final Dispatch Button */}
            <div className="rfq-dispatch-box">
              <div className="rfq-dispatch-summary">
                <div>Items: <strong>{selectedItems.length} Products</strong></div>
                <div>Vendors: <strong>{selectedVendors.length} Suppliers</strong></div>
              </div>

              <button
                type="button"
                onClick={handleSendRFQ}
                disabled={isSubmitting}
                className="rfq-btn rfq-btn--primary rfq-btn--lg rfq-btn--full rfq-btn--glow"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="rfq-spin" />
                    <span>Dispatching RFQ to Vendors...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send RFQ to {selectedVendors.length} Vendors</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQReviewStep;

