"use client";
import React from 'react';
import type { VendorQuotation } from '../../types/rfq';
import {
  FileText,
  X,
  Building2,
  Calendar,
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface VendorQuotationModalProps {
  isOpen: boolean;
  quotation: VendorQuotation | null;
  isApproved?: boolean;
  onApprove?: () => void;
  onClose: () => void;
}

export const VendorQuotationModal: React.FC<VendorQuotationModalProps> = ({
  isOpen,
  quotation,
  isApproved = false,
  onApprove,
  onClose,
}) => {
  if (!isOpen || !quotation) return null;

  return (
    <div className="rfq-modal-backdrop" onClick={onClose}>
      <div
        className="rfq-modal-card rfq-modal-card--quotation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rfq-modal-header rfq-quotation-modal-header">
          <div
            className={`rfq-modal-header-icon ${
              isApproved ? 'rfq-modal-header-icon--green' : 'rfq-modal-header-icon--indigo'
            }`}
          >
            {isApproved ? <ShieldCheck size={20} /> : <FileText size={20} />}
          </div>
          <div className="rfq-modal-header-text">
            <div className="rfq-quotation-header-top">
              <h3 className="rfq-modal-title">{quotation.vendorName}</h3>
              {isApproved ? (
                <span className="rfq-quotation-badge rfq-quotation-badge--approved">
                  <ShieldCheck size={12} />
                  Quotation Approved
                </span>
              ) : (
                <span className="rfq-quotation-badge">
                  <CheckCircle2 size={12} />
                  Quotation Received
                </span>
              )}
            </div>
            <p className="rfq-modal-sub">
              Quote Ref: <strong>{quotation.quotationNumber}</strong> · Submitted on {quotation.submittedDate} at {quotation.submittedTime}
            </p>
          </div>
          <button
            className="rfq-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="rfq-modal-body rfq-modal-body--scrollable rfq-quotation-modal-body">
          {/* Quoted Items Table */}
          <div className="rfq-quotation-section">
            <div className="rfq-quotation-section__header">
              <Package size={16} className="rfq-icon-indigo" />
              <h4 className="rfq-quotation-section__title">Quoted Line Items</h4>
            </div>

            <div className="rfq-quotation-table-wrap">
              <table className="rfq-quotation-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name &amp; Model</th>
                    <th>Requested Qty</th>
                    <th>Quoted Unit Price</th>
                    <th className="rfq-text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.quotedItems.map((item, idx) => (
                    <tr key={item.itemId || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{item.itemName}</strong>
                        <span className="rfq-quotation-model-tag">
                          SKU: {item.model}
                        </span>
                      </td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="rfq-text-right">
                        <strong>₹{item.lineTotal.toLocaleString('en-IN')}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial Terms & Pricing Summary Grid */}
          <div className="rfq-quotation-grid">
            {/* Left: Commercial Logistics & Terms */}
            <div className="rfq-quotation-card">
              <h4 className="rfq-quotation-card__title">Commercial &amp; Delivery Terms</h4>
              <div className="rfq-quotation-terms-list">
                <div className="rfq-quotation-term">
                  <Truck size={15} className="rfq-icon-indigo" />
                  <div>
                    <span className="rfq-quotation-term__label">Delivery Timeline</span>
                    <span className="rfq-quotation-term__value">{quotation.deliveryTimeline}</span>
                  </div>
                </div>
                <div className="rfq-quotation-term">
                  <CreditCard size={15} className="rfq-icon-indigo" />
                  <div>
                    <span className="rfq-quotation-term__label">Payment Terms</span>
                    <span className="rfq-quotation-term__value">{quotation.paymentTerms}</span>
                  </div>
                </div>
                <div className="rfq-quotation-term">
                  <Calendar size={15} className="rfq-icon-indigo" />
                  <div>
                    <span className="rfq-quotation-term__label">Quotation Validity</span>
                    <span className="rfq-quotation-term__value">{quotation.validityDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Financial Breakdown */}
            <div className="rfq-quotation-card rfq-quotation-card--totals">
              <h4 className="rfq-quotation-card__title">Financial Breakdown</h4>
              <div className="rfq-quotation-totals-list">
                <div className="rfq-quotation-total-row">
                  <span>Subtotal (Excl. Tax)</span>
                  <span>₹{quotation.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="rfq-quotation-total-row">
                  <span>GST / Applicable Taxes ({(quotation.taxRate * 100).toFixed(0)}%)</span>
                  <span>₹{quotation.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="rfq-quotation-total-row rfq-quotation-total-row--grand">
                  <span>Total Quotation Value</span>
                  <span>₹{quotation.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Comments / Notes */}
          {quotation.vendorComments && (
            <div className="rfq-quotation-section">
              <h4 className="rfq-quotation-card__title">Vendor Remarks &amp; Technical Notes</h4>
              <div className="rfq-quotation-notes-box">
                <p>{quotation.vendorComments}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rfq-modal-footer rfq-modal-footer--between">
          <button
            type="button"
            className="rfq-btn rfq-btn--secondary"
            onClick={onClose}
          >
            <ArrowLeft size={14} />
            <span>Back to Vendor Responses</span>
          </button>

          {isApproved ? (
            <div className="rfq-modal-approved-badge">
              <ShieldCheck size={16} />
              <span>✓ Quotation Approved</span>
            </div>
          ) : onApprove ? (
            <button
              type="button"
              className="rfq-btn rfq-btn--primary rfq-btn--approve-btn"
              onClick={onApprove}
            >
              <CheckCircle2 size={15} />
              <span>Approve Quotation</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VendorQuotationModal;
