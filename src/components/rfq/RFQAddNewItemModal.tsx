"use client";
import React from 'react';
import { PackagePlus, ArrowRight, X, Database } from 'lucide-react';

interface RFQAddNewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RFQAddNewItemModal: React.FC<RFQAddNewItemModalProps> = ({
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
          <div className="rfq-modal-header-icon rfq-modal-header-icon--blue">
            <PackagePlus size={20} />
          </div>
          <div className="rfq-modal-header-text">
            <h3 className="rfq-modal-title">Add Item via Item Master</h3>
            <p className="rfq-modal-sub">Enterprise Item Catalog Pathway</p>
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
            <Database size={18} className="rfq-modal-info-box__icon" />
            <div>
              <p className="rfq-modal-info-box__title">
                Item Master Governance Required
              </p>
              <p className="rfq-modal-info-box__desc">
                To ensure inventory traceability, tax classification (HSN/SAC), and centralized specification management, new products and services must be registered through the <strong>Item Master</strong> catalog before issuing an RFQ.
              </p>
            </div>
          </div>

          <div className="rfq-pathway-steps">
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">1</span>
              <span>Submit item registration with base specifications in Item Master.</span>
            </div>
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">2</span>
              <span>Procurement admin approves the item code and classification.</span>
            </div>
            <div className="rfq-pathway-step">
              <span className="rfq-pathway-num">3</span>
              <span>The item instantly becomes selectable for all future RFQs and POs.</span>
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
              // In production, navigate to /transact/item
            }}
          >
            <span>Go to Item Master</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFQAddNewItemModal;

