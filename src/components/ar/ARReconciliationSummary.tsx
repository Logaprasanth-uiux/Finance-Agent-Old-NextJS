"use client";
import React from 'react';
import type { ARPayment } from '../../types/ar';
import { formatCurrencyINR } from '../../data/arMockData';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ARReconciliationSummaryProps {
  payment: ARPayment;
}

export const ARReconciliationSummary: React.FC<ARReconciliationSummaryProps> = ({ payment }) => {
  const matchPercentage =
    payment.paymentAmount > 0
      ? Math.min(100, Math.round((payment.matchedAmount / payment.paymentAmount) * 100))
      : 0;

  const isFullyReconciled = payment.remainingAmount === 0 && payment.matchedAmount > 0;
  const isPartiallyMatched = payment.remainingAmount > 0 && payment.matchedAmount > 0;
  const isUnmatched = payment.matchedAmount === 0;

  return (
    <section className="ar-recon-summary-section">
      <div className="ar-recon-summary-section__header">
        <h3 className="ar-recon-summary-section__title">Reconciliation Summary</h3>
        <div className="ar-recon-summary-section__match-meter">
          <span className="ar-recon-summary-section__pct-label">
            {matchPercentage}% Matched
          </span>
          <div className="ar-recon-summary-progress">
            <div
              className={`ar-recon-summary-progress__bar ${
                isFullyReconciled
                  ? 'ar-recon-summary-progress__bar--full'
                  : isPartiallyMatched
                  ? 'ar-recon-summary-progress__bar--partial'
                  : 'ar-recon-summary-progress__bar--zero'
              }`}
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="ar-recon-metrics-grid">
        {/* Metric 1: Payment Received */}
        <div className="ar-recon-metric-card">
          <div className="ar-recon-metric-card__header">
            <span className="ar-recon-metric-card__label">Payment Received</span>
            <span className="ar-recon-metric-card__badge ar-recon-metric-card__badge--inbound">
              Inbound
            </span>
          </div>
          <div className="ar-recon-metric-card__value">
            {formatCurrencyINR(payment.paymentAmount)}
          </div>
          <div className="ar-recon-metric-card__sub">
            Bank Credit · {payment.paymentChannel}
          </div>
        </div>

        {/* Divider icon */}
        <div className="ar-recon-metrics-divider">
          <ArrowRight size={18} />
        </div>

        {/* Metric 2: Matched Amount */}
        <div className="ar-recon-metric-card">
          <div className="ar-recon-metric-card__header">
            <span className="ar-recon-metric-card__label">Matched Amount</span>
            <span className="ar-recon-metric-card__badge ar-recon-metric-card__badge--matched">
              {payment.matchedInvoices.length} {payment.matchedInvoices.length === 1 ? 'Invoice' : 'Invoices'}
            </span>
          </div>
          <div className="ar-recon-metric-card__value ar-recon-metric-card__value--matched">
            {formatCurrencyINR(payment.matchedAmount)}
          </div>
          <div className="ar-recon-metric-card__sub">
            Allocated to Open Invoices
          </div>
        </div>

        {/* Divider icon */}
        <div className="ar-recon-metrics-divider">
          <ArrowRight size={18} />
        </div>

        {/* Metric 3: Remaining / Unmatched */}
        <div
          className={`ar-recon-metric-card ${
            isFullyReconciled
              ? 'ar-recon-metric-card--zero-diff'
              : isPartiallyMatched
              ? 'ar-recon-metric-card--has-diff'
              : 'ar-recon-metric-card--unmatched'
          }`}
        >
          <div className="ar-recon-metric-card__header">
            <span className="ar-recon-metric-card__label">
              {isFullyReconciled ? 'Remaining / Difference' : 'Unmatched Remaining'}
            </span>
            {isFullyReconciled ? (
              <span className="ar-recon-metric-card__badge ar-recon-metric-card__badge--zero">
                <CheckCircle2 size={11} /> Balanced
              </span>
            ) : (
              <span className="ar-recon-metric-card__badge ar-recon-metric-card__badge--alert">
                <AlertTriangle size={11} /> Discrepancy
              </span>
            )}
          </div>
          <div
            className={`ar-recon-metric-card__value ${
              isFullyReconciled
                ? 'ar-recon-metric-card__value--zero'
                : 'ar-recon-metric-card__value--diff'
            }`}
          >
            {formatCurrencyINR(payment.remainingAmount)}
          </div>
          <div className="ar-recon-metric-card__sub">
            {isFullyReconciled && '₹0 Balance discrepancy · Ready for ERP clearing'}
            {isPartiallyMatched && '₹2.80L unallocated · Requires TDS offset / on-account credit'}
            {isUnmatched && 'Pending invoice identification and matching'}
          </div>
        </div>
      </div>

      {/* Dynamic Reconciliation Status Banner */}
      {isFullyReconciled && (
        <div className="ar-recon-banner ar-recon-banner--success">
          <ShieldCheck size={18} className="ar-recon-banner__icon" />
          <div className="ar-recon-banner__text">
            <strong>Full Reconciliation Verified:</strong> The received payment of{' '}
            {formatCurrencyINR(payment.paymentAmount)} exactly matches the net invoice settlement amount with ₹0 remaining balance.
          </div>
        </div>
      )}

      {isPartiallyMatched && (
        <div className="ar-recon-banner ar-recon-banner--warning">
          <AlertTriangle size={18} className="ar-recon-banner__icon" />
          <div className="ar-recon-banner__text">
            <strong>Partial Match Alert:</strong> {formatCurrencyINR(payment.matchedAmount)} has been matched against open invoice(s). An unallocated balance of{' '}
            <strong>{formatCurrencyINR(payment.remainingAmount)}</strong> remains unassigned.
          </div>
        </div>
      )}

      {isUnmatched && (
        <div className="ar-recon-banner ar-recon-banner--review">
          <HelpCircle size={18} className="ar-recon-banner__icon" />
          <div className="ar-recon-banner__text">
            <strong>Needs Review:</strong> No invoice has been automatically booked against this payment. Check the candidate suggestions below to execute 1-click reconciliation.
          </div>
        </div>
      )}
    </section>
  );
};

export default ARReconciliationSummary;

