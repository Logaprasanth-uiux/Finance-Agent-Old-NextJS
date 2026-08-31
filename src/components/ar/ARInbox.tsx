"use client";
import React, { useState, useMemo } from 'react';
import type { ARPayment, ReconciliationStatus, PaymentAttachment } from '../../types/ar';
import ARInboxCard from './ARInboxCard';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';

interface ARInboxProps {
  payments: ARPayment[];
  selectedPaymentId: string;
  onSelectPayment: (payment: ARPayment) => void;
  onOpenAttachment?: (attachment: PaymentAttachment) => void;
}

type FilterTab = 'ALL' | ReconciliationStatus;

export const ARInbox: React.FC<ARInboxProps> = ({
  payments,
  selectedPaymentId,
  onSelectPayment,
  onOpenAttachment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Search filter
      const matchesSearch =
        payment.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.senderAccount &&
          payment.senderAccount.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Status tab filter
      if (activeFilter === 'ALL') return true;
      return payment.status === activeFilter;
    });
  }, [payments, searchTerm, activeFilter]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      ALL: payments.length,
      'Needs Review': payments.filter((p) => p.status === 'Needs Review').length,
      'Partially Matched': payments.filter((p) => p.status === 'Partially Matched').length,
      'Fully Reconciled': payments.filter((p) => p.status === 'Fully Reconciled').length,
      Posted: payments.filter((p) => p.status === 'Posted').length,
    };
  }, [payments]);

  return (
    <aside className="ar-inbox-pane">
      {/* Pane Header */}
      <div className="ar-inbox-pane__header">
        <div className="ar-inbox-pane__title-row">
          <div className="ar-inbox-pane__title-wrap">
            <Inbox size={18} className="ar-inbox-pane__icon" />
            <h2 className="ar-inbox-pane__title">INBOX</h2>
          </div>
          <span className="ar-inbox-pane__counter">
            {payments.length} Payments
          </span>
        </div>

        {/* Search Bar */}
        <div className="ar-inbox-pane__search">
          <Search size={15} className="ar-inbox-pane__search-icon" />
          <input
            type="text"
            placeholder="Search sender, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ar-inbox-pane__search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="ar-inbox-pane__search-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="ar-inbox-pane__filters">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`ar-inbox-pill ${activeFilter === 'ALL' ? 'ar-inbox-pill--active' : ''}`}
          >
            All <span className="ar-inbox-pill__badge">{counts.ALL}</span>
          </button>
          <button
            onClick={() => setActiveFilter('Needs Review')}
            className={`ar-inbox-pill ${
              activeFilter === 'Needs Review' ? 'ar-inbox-pill--active' : ''
            }`}
          >
            Review <span className="ar-inbox-pill__badge">{counts['Needs Review']}</span>
          </button>
          <button
            onClick={() => setActiveFilter('Partially Matched')}
            className={`ar-inbox-pill ${
              activeFilter === 'Partially Matched' ? 'ar-inbox-pill--active' : ''
            }`}
          >
            Partial <span className="ar-inbox-pill__badge">{counts['Partially Matched']}</span>
          </button>
          <button
            onClick={() => setActiveFilter('Fully Reconciled')}
            className={`ar-inbox-pill ${
              activeFilter === 'Fully Reconciled' ? 'ar-inbox-pill--active' : ''
            }`}
          >
            Reconciled <span className="ar-inbox-pill__badge">{counts['Fully Reconciled']}</span>
          </button>
          <button
            onClick={() => setActiveFilter('Posted')}
            className={`ar-inbox-pill ${activeFilter === 'Posted' ? 'ar-inbox-pill--active' : ''}`}
          >
            Posted <span className="ar-inbox-pill__badge">{counts.Posted}</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="ar-inbox-pane__list">
        {filteredPayments.length === 0 ? (
          <div className="ar-inbox-pane__empty">
            <SlidersHorizontal size={24} />
            <p>No payment records match the current filter</p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <ARInboxCard
              key={payment.id}
              payment={payment}
              isSelected={payment.id === selectedPaymentId}
              onSelect={onSelectPayment}
              onOpenAttachment={onOpenAttachment}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default ARInbox;

