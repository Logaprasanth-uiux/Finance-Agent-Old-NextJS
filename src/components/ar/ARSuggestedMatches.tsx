"use client";
import React from 'react';
import type { SuggestedInvoiceMatch, ARPayment } from '../../types/ar';
import { formatCurrencyINR } from '../../data/arMockData';
import { Sparkles, CheckCircle, ShieldCheck, Check } from 'lucide-react';

interface ARSuggestedMatchesProps {
  payment: ARPayment;
  onAcceptMatch: (paymentId: string, suggestion: SuggestedInvoiceMatch) => void;
}

export const ARSuggestedMatches: React.FC<ARSuggestedMatchesProps> = ({
  payment,
  onAcceptMatch,
}) => {
  const suggestions = payment.suggestedMatches || [];

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="ar-suggestions-panel">
      <div className="ar-suggestions-panel__header">
        <div className="ar-suggestions-panel__title-wrap">
          <Sparkles size={16} className="ar-color-purple" />
          <h4 className="ar-suggestions-panel__title">
            AI & Rule Engine Reconciliation Match
          </h4>
        </div>
        <span className="ar-suggestions-panel__badge">
          {suggestions.length} Candidate Detected
        </span>
      </div>

      <p className="ar-suggestions-panel__intro">
        The system identified the following high-confidence sales invoice matching this unallocated payment.
      </p>

      <div className="ar-suggestions-list">
        {suggestions.map((sugg, idx) => (
          <div key={idx} className="ar-suggestion-card">
            <div className="ar-suggestion-card__top">
              <div className="ar-suggestion-card__left">
                <div className="ar-suggestion-card__confidence-pill">
                  <ShieldCheck size={13} />
                  <span>{sugg.confidenceScore}% Match Confidence</span>
                </div>
                <h5 className="ar-suggestion-card__doc-title">
                  {sugg.invoice.docRef} · {sugg.invoice.description}
                </h5>
              </div>

              <button
                onClick={() => onAcceptMatch(payment.id, sugg)}
                className="ar-btn ar-btn--primary ar-btn--match"
                title="Accept and link this invoice to reconcile payment"
              >
                <Check size={14} />
                Accept & Match Invoice
              </button>
            </div>

            {/* Financial summary of suggestion */}
            <div className="ar-suggestion-card__amounts-grid">
              <div className="ar-suggestion-metric">
                <span className="ar-suggestion-metric__label">Invoice Net</span>
                <span className="ar-suggestion-metric__value">
                  {formatCurrencyINR(sugg.invoice.netAmount)}
                </span>
              </div>
              <div className="ar-suggestion-metric">
                <span className="ar-suggestion-metric__label">Gross Amount</span>
                <span className="ar-suggestion-metric__value">
                  {formatCurrencyINR(sugg.invoice.grossAmount)}
                </span>
              </div>
              <div className="ar-suggestion-metric">
                <span className="ar-suggestion-metric__label">TDS Withheld</span>
                <span className="ar-suggestion-metric__value ar-color-amber">
                  - {formatCurrencyINR(sugg.invoice.tdsAmount)}
                </span>
              </div>
              <div className="ar-suggestion-metric">
                <span className="ar-suggestion-metric__label">Doc Date</span>
                <span className="ar-suggestion-metric__value">{sugg.invoice.docDate}</span>
              </div>
            </div>

            {/* Match reasoning list */}
            <div className="ar-suggestion-card__reasons">
              <span className="ar-suggestion-card__reasons-title">Matching Signals:</span>
              <ul className="ar-suggestion-card__reasons-list">
                {sugg.matchReasons.map((reason, rIdx) => (
                  <li key={rIdx} className="ar-suggestion-card__reason-item">
                    <CheckCircle size={12} className="ar-color-emerald" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ARSuggestedMatches;

