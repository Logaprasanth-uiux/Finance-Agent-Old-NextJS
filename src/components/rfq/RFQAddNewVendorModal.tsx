"use client";
import React from 'react';
import { UserPlus, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface RFQAddNewVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RFQAddNewVendorModal: React.FC<RFQAddNewVendorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="rfq-modal-backdrop" onClick={onClose}>
      <div
        className="rfq-modal-card rfq-modal-card--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rfq-modal-header">
          <div className="rfq-modal-header-icon rfq-modal-header-icon--purple">
            <UserPlus size={20} />
          </div>
          <div className="rfq-modal-header-text">
            <h3 className="rfq-modal-title">Add Vendor via Vendor Master</h3>
            <p className="rfq-modal-sub">Enterprise Supplier Onboarding</p>
          </div>
          <button
            className="rfq-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rfq-modal-body">
          <div className="rfq-modal-info-box">
            <ShieldCheck size={18} className="rfq-modal-info-box__icon rfq-icon-purple" />
            <div>
              <p className="rfq-modal-info-box__title">
                Compliance & KYV Verification
              </p>
              <p className="rfq-modal-info-box__desc">
                Vendors must be onboarded through <strong>Vendor Master</strong> to complete GSTIN verification, bank mandate validation, and compliance checks before receiving official RFQ invitations.
              </p>
            </div>
          </div>

          <div className="rfq-pathway-steps">
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">1</span>
              <span>Initiate vendor onboarding with corporate PAN/GSTIN and commercial details.</span>
            </div>
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">2</span>
              <span>Vendor completes self-service compliance profile and bank details.</span>
            </div>
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">3</span>
              <span>Approved vendor is available across RFQ bidding and PO workflows.</span>
            </div>
          </div>
        </div>

        <div className="rfq-modal-footer">
          <button
            type="button"
            className="rfq-btn rfq-btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rfq-btn rfq-btn--primary"
            onClick={() => {
              onClose();
              // In production, navigate to /transact/vendor
            }}
          >
            <span>Go to Vendor Master</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFQAddNewVendorModal;

