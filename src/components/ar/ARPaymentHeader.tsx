"use client";
import React, { useState } from 'react';
import type { ARPayment, PaymentAttachment } from '../../types/ar';
import { formatCurrencyINR } from '../../data/arMockData';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Send,
  Building2,
  Calendar,
  CreditCard,
  Copy,
  Check,
  Paperclip,
} from 'lucide-react';

interface ARPaymentHeaderProps {
  payment: ARPayment;
  onPostToERP: (paymentId: string) => void;
  isPosting: boolean;
  onOpenAttachment?: (attachment: PaymentAttachment) => void;
}

export const ARPaymentHeader: React.FC<ARPaymentHeaderProps> = ({
  payment,
  onPostToERP,
  isPosting,
  onOpenAttachment,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(payment.paymentRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (payment.status) {
      case 'Fully Reconciled':
        return (
          <span className="ar-status-badge ar-status-reconciled">
            <CheckCircle2 size={13} />
            Fully Reconciled
          </span>
        );
      case 'Partially Matched':
        return (
          <span className="ar-status-badge ar-status-partial">
            <AlertTriangle size={13} />
            Partially Matched
          </span>
        );
      case 'Needs Review':
        return (
          <span className="ar-status-badge ar-status-review">
            <Clock size={13} />
            Needs Review
          </span>
        );
      case 'Posted':
        return (
          <span className="ar-status-badge ar-status-posted">
            <FileCheck size={13} />
            Posted
          </span>
        );
    }
  };

  const renderERPActionArea = () => {
    if (payment.erpStatus === 'Ready to Post') {
      return (
        <div className="ar-payment-header-card__action-zone">
          <button
            onClick={() => onPostToERP(payment.id)}
            disabled={isPosting}
            className="ar-btn ar-btn--primary ar-btn--erp"
            title="Post reconciled payment and invoice clearing to SAP ERP"
          >
            <Send size={14} className={isPosting ? 'ar-spin' : ''} />
            <span>{isPosting ? 'Posting...' : 'Post to ERP'}</span>
          </button>
          <div className="ar-erp-action-subline ar-erp-action-subline--ready">
            <Check size={12} className="ar-erp-action-subline__icon" />
            <span>Ready to post</span>
          </div>
        </div>
      );
    }

    if (payment.erpStatus === 'Posted') {
      return (
        <div className="ar-payment-header-card__action-zone">
          <button
            disabled={true}
            className="ar-btn ar-btn--posted ar-btn--erp"
            title="Transaction successfully posted to SAP ERP"
          >
            <CheckCircle2 size={14} />
            <span>Posted</span>
          </button>
          <div className="ar-erp-action-subline ar-erp-action-subline--posted">
            <Check size={12} className="ar-erp-action-subline__icon" />
            <span>Posted to ERP</span>
          </div>
        </div>
      );
    }

    // Default: Not ready to post (Pending Match / On Hold / Partially Matched / Needs Review)
    return (
      <div className="ar-payment-header-card__action-zone">
        <button
          disabled={true}
          className="ar-btn ar-btn--disabled ar-btn--erp"
          title="Payment must be fully reconciled before posting to ERP"
        >
          <Send size={14} />
          <span>Post to ERP</span>
        </button>
        <div className="ar-erp-action-subline ar-erp-action-subline--warning">
          <AlertTriangle size={12} className="ar-erp-action-subline__icon" />
          <span>Not ready to post</span>
        </div>
      </div>
    );
  };

  const allAttachments: PaymentAttachment[] =
    payment.attachments && payment.attachments.length > 0
      ? payment.attachments
      : payment.attachment
      ? [payment.attachment]
      : [];

  return (
    <div className="ar-payment-header-card">
      <div className="ar-payment-header-card__top">
        {/* Left: Sender + Payment Information + Attachments */}
        <div className="ar-payment-header-card__identity-zone">
          <div
            className="ar-payment-header-card__avatar"
            style={{ backgroundColor: payment.senderColor || '#4F46E5' }}
          >
            {payment.senderLogoInitial || payment.sender.slice(0, 2).toUpperCase()}
          </div>
          <div className="ar-payment-header-card__sender-details">
            <div className="ar-payment-header-card__sender-sub">
              <span>Payment Received</span>
              {payment.senderAccount && (
                <span className="ar-payment-header-card__dot-sep">·</span>
              )}
              {payment.senderAccount && <span>{payment.senderAccount}</span>}
            </div>
            <h2 className="ar-payment-header-card__sender-title">{payment.sender}</h2>
            <div className="ar-payment-header-card__amount-row">
              <span className="ar-payment-header-card__amount">
                {formatCurrencyINR(payment.paymentAmount)}
              </span>
              <span className="ar-payment-header-card__channel-pill">
                <CreditCard size={13} />
                {payment.paymentChannel}
              </span>
            </div>

            {/* Attachments placed below payment amount & method */}
            {allAttachments.length > 0 && (
              <div className="ar-payment-header-card__attachments-stack">
                {allAttachments.map((att, idx) => (
                  <button
                    key={`${att.name}-${idx}`}
                    type="button"
                    onClick={() => onOpenAttachment?.(att)}
                    className="ar-header-attachment-btn"
                    title={`View ${att.name} (${att.size})`}
                  >
                    <Paperclip size={13} className="ar-header-attachment-btn__icon" />
                    <span className="ar-header-attachment-btn__name">
                      {att.name}
                    </span>
                    <span className="ar-header-attachment-btn__size">
                      ({att.size})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Unified ERP Action & Status */}
        {renderERPActionArea()}
      </div>

      {/* Metadata Row */}
      <div className="ar-payment-header-card__meta-bar">
        <div className="ar-payment-header-card__meta-items">
          <div className="ar-payment-meta-item">
            <Calendar size={14} className="ar-payment-meta-item__icon" />
            <span className="ar-payment-meta-item__label">Received:</span>
            <span className="ar-payment-meta-item__val">
              {payment.receivedDate} · {payment.receivedTime}
            </span>
          </div>

          <div className="ar-payment-meta-item">
            <span className="ar-payment-meta-item__label">Reference:</span>
            <code className="ar-payment-meta-item__code">{payment.paymentRef}</code>
            <button
              onClick={handleCopyRef}
              className="ar-payment-meta-item__copy-btn"
              title="Copy Reference"
            >
              {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
            </button>
          </div>

          <div className="ar-payment-meta-item">
            <Building2 size={14} className="ar-payment-meta-item__icon" />
            <span className="ar-payment-meta-item__label">SAP Doc:</span>
            <span
              className={`ar-payment-meta-item__val ${
                payment.sapDoc !== '—' ? 'ar-payment-meta-item__val--sap' : 'ar-payment-meta-item__val--empty'
              }`}
            >
              {payment.sapDoc}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="ar-payment-header-card__badges-group">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default ARPaymentHeader;

