"use client";
import React from 'react';
import type { ARPayment, PaymentAttachment } from '../../types/ar';
import { formatCurrencyINR } from '../../data/arMockData';
import { CheckCircle2, Clock, AlertTriangle, FileCheck } from 'lucide-react';

interface ARInboxCardProps {
  payment: ARPayment;
  isSelected: boolean;
  onSelect: (payment: ARPayment) => void;
  onOpenAttachment?: (attachment: PaymentAttachment) => void;
}

export const ARInboxCard: React.FC<ARInboxCardProps> = ({
  payment,
  isSelected,
  onSelect,
}) => {
  const getStatusBadge = () => {
    switch (payment.status) {
      case 'Fully Reconciled':
        return (
          <span className="ar-status-badge ar-status-reconciled">
            <CheckCircle2 size={12} />
            Fully Reconciled
          </span>
        );
      case 'Partially Matched':
        return (
          <span className="ar-status-badge ar-status-partial">
            <AlertTriangle size={12} />
            Partially Matched
          </span>
        );
      case 'Needs Review':
        return (
          <span className="ar-status-badge ar-status-review">
            <Clock size={12} />
            Needs Review
          </span>
        );
      case 'Posted':
        return (
          <span className="ar-status-badge ar-status-posted">
            <FileCheck size={12} />
            Posted
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(payment)}
      className={`ar-inbox-card ${isSelected ? 'ar-inbox-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(payment);
        }
      }}
    >
      {/* Active Indicator Bar on Left */}
      <div className="ar-inbox-card__indicator" />

      <div className="ar-inbox-card__header">
        <div className="ar-inbox-card__sender-group">
          <div
            className="ar-inbox-card__avatar"
            style={{ backgroundColor: payment.senderColor || '#4F46E5' }}
          >
            {payment.senderLogoInitial || payment.sender.slice(0, 2).toUpperCase()}
          </div>
          <div className="ar-inbox-card__sender-info">
            <h4 className="ar-inbox-card__sender-name" title={payment.sender}>
              {payment.sender}
            </h4>
            <span className="ar-inbox-card__subtitle">Payment received</span>
          </div>
        </div>
        <div className="ar-inbox-card__time">
          {payment.receivedDate} · {payment.receivedTime}
        </div>
      </div>

      <div className="ar-inbox-card__body">
        <div className="ar-inbox-card__amount">
          {formatCurrencyINR(payment.paymentAmount)}
        </div>
        <div className="ar-inbox-card__status-wrap">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default ARInboxCard;

