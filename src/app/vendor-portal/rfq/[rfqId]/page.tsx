"use client";

import React, { useState, useMemo, use, useEffect } from 'react';
import Link from 'next/link';
import type { RFQRecord, ItemSpecification, QuotedItem, VendorQuotation, VendorResponse } from '@/types/rfq';
import { mockCompanyRFQs, mockCatalogItems } from '@/data/rfqMockData';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Lock,
  Truck,
  CreditCard,
  Edit3,
  Send,
  Check,
  ShieldCheck,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';

const CURRENT_VENDOR_NAME = 'Acme Global';

interface PageProps {
  params: Promise<{ rfqId: string }>;
}

type ItemCompletionState = 'completed' | 'incomplete' | 'not-started';

export default function VendorRFQDetailPage({ params }: PageProps) {
  const { rfqId } = use(params);

  // 1. Locate matching RFQ from mock database
  const rfq = useMemo(() => {
    for (const companyGroup of Object.values(mockCompanyRFQs)) {
      const found = [...companyGroup.running, ...companyGroup.completed].find(
        (r) => r.id === rfqId
      );
      if (found) return found;
    }
    return null;
  }, [rfqId]);

  // Determine existing vendor response if previously submitted
  const existingVendorResponse = useMemo(() => {
    if (!rfq?.vendorResponses) return null;
    return rfq.vendorResponses.find((vr) =>
      vr.vendorName.toLowerCase().includes(CURRENT_VENDOR_NAME.toLowerCase())
    );
  }, [rfq]);

  const hasAlreadySubmitted =
    existingVendorResponse?.status === 'Quotation Received' ||
    existingVendorResponse?.status === 'Quotation Approved';

  // 2. View Mode state: 'entry' | 'review' | 'submitted'
  const [viewMode, setViewMode] = useState<'entry' | 'review' | 'submitted'>(
    hasAlreadySubmitted ? 'submitted' : 'entry'
  );

  // Fallback itemsDetail if not present in mock record
  const itemsDetail = useMemo(() => {
    if (rfq?.itemsDetail && rfq.itemsDetail.length > 0) {
      return rfq.itemsDetail;
    }
    return [
      {
        item: mockCatalogItems[0],
        quantity: rfq?.totalQuantity || 10,
        specifications: [...mockCatalogItems[0].baseSpecs],
        aiEnriched: false,
      },
    ];
  }, [rfq]);

  // 3. Form States for Quotation Response
  // Unit prices: Record<itemId, number>
  // Initial demo data showcases completed, incomplete, and not-started items
  const [unitPrices, setUnitPrices] = useState<Record<string, number>>(() => {
    // Check if quote was previously persisted
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`vp_quote_${rfqId}`);
        if (saved) {
          const parsed = JSON.parse(saved) as VendorQuotation;
          const prices: Record<string, number> = {};
          parsed.quotedItems?.forEach((qi) => {
            prices[qi.itemId] = qi.unitPrice;
          });
          return prices;
        }
      } catch (e) {
        // ignore
      }
    }

    const init: Record<string, number> = {};
    itemsDetail.forEach((itemSel, idx) => {
      if (idx === 0) {
        init[itemSel.item.id] = 68000; // Item 1: Completed
      } else if (idx === 1) {
        init[itemSel.item.id] = 42500; // Item 2: Completed
      } else if (idx === 2) {
        init[itemSel.item.id] = 115000; // Item 3: Completed with custom alternate spec
      } else {
        init[itemSel.item.id] = 0; // Items 4-8: Pricing pending
      }
    });
    return init;
  });

  // Vendor Quoted Specs: Record<itemId, Record<specId, { vendorValue: string; note: string }>>
  const [vendorSpecs, setVendorSpecs] = useState<
    Record<string, Record<string, { vendorValue: string; note: string }>>
  >(() => {
    const init: Record<string, Record<string, { vendorValue: string; note: string }>> = {};
    itemsDetail.forEach((itemSel, idx) => {
      init[itemSel.item.id] = {};
      itemSel.specifications.forEach((spec, specIdx) => {
        let vendorValue = spec.value;
        let note = '';

        if (idx === 2 && specIdx === 0) {
          // Item 3 (Dell Latitude): Vendor quotes higher spec processor
          vendorValue = 'Intel Core Ultra 7 165H (vPro Enterprise)';
          note = 'Upgraded to high-performance 165H enterprise variant with integrated AI Boost.';
        } else if (idx === 3 && specIdx === 2) {
          // Item 4 (Logitech Combo): Incomplete note added
          note = 'Includes Logi Bolt enterprise encrypted USB receivers in each combo pack.';
        }

        init[itemSel.item.id][spec.id] = {
          vendorValue,
          note,
        };
      });
    });
    return init;
  });

  // Active note editor state
  const [activeNoteTarget, setActiveNoteTarget] = useState<{
    itemId: string;
    specId: string;
  } | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Commercial Terms
  const [deliveryTimeline, setDeliveryTimeline] = useState('14 Business Days');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [validityDate, setValidityDate] = useState('30 Days from submission');
  const [vendorComments, setVendorComments] = useState(
    'Includes comprehensive 3-year on-site OEM warranty. Consolidated delivery to facility with transit insurance.'
  );
  const [taxRate, setTaxRate] = useState(0.18); // 18% GST

  // Submission metadata state
  const [submittedQuoteMeta, setSubmittedQuoteMeta] = useState<{
    quotationNumber: string;
    submittedDate: string;
    submittedTime: string;
    totalAmount: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check localStorage / mock data for persisted client submission on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMeta = localStorage.getItem(`vp_quote_meta_${rfqId}`);
        if (savedMeta) {
          const parsed = JSON.parse(savedMeta);
          setSubmittedQuoteMeta(parsed);
          setViewMode('submitted');
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    if (hasAlreadySubmitted && existingVendorResponse?.quotation) {
      setSubmittedQuoteMeta({
        quotationNumber: existingVendorResponse.quotation.quotationNumber,
        submittedDate: existingVendorResponse.quotation.submittedDate,
        submittedTime: existingVendorResponse.quotation.submittedTime,
        totalAmount: existingVendorResponse.quotation.totalAmount,
      });
      setViewMode('submitted');
    }
  }, [hasAlreadySubmitted, existingVendorResponse, rfqId]);

  // Handle Spec Value Change
  const handleSpecChange = (itemId: string, specId: string, value: string) => {
    setVendorSpecs((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [specId]: {
          ...prev[itemId]?.[specId],
          vendorValue: value,
        },
      },
    }));
  };

  // Open note editor
  const handleOpenNoteEditor = (itemId: string, specId: string) => {
    const current = vendorSpecs[itemId]?.[specId]?.note || '';
    setNoteDraft(current);
    setActiveNoteTarget({ itemId, specId });
  };

  // Save per-spec note
  const handleSaveNote = () => {
    if (!activeNoteTarget) return;
    const { itemId, specId } = activeNoteTarget;
    setVendorSpecs((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [specId]: {
          ...prev[itemId]?.[specId],
          note: noteDraft.trim(),
        },
      },
    }));
    setActiveNoteTarget(null);
    setNoteDraft('');
  };

  // Item completion status calculation
  const getItemStatus = (itemId: string): ItemCompletionState => {
    const price = unitPrices[itemId];
    const itemSel = itemsDetail.find((i) => i.item.id === itemId);
    if (!itemSel) return 'not-started';

    const specs = itemSel.specifications;
    const itemSpecsMap = vendorSpecs[itemId] || {};

    const allSpecsFilled = specs.every((s) => {
      const v = itemSpecsMap[s.id]?.vendorValue;
      return v !== undefined && v.trim().length > 0;
    });

    const hasValidPrice = typeof price === 'number' && price > 0;

    if (hasValidPrice && allSpecsFilled) {
      return 'completed';
    }

    const hasAnySpecEdited = specs.some((s) => {
      const v = itemSpecsMap[s.id]?.vendorValue;
      const note = itemSpecsMap[s.id]?.note;
      return (v !== undefined && v !== s.value) || (note && note.trim().length > 0);
    });

    if (!hasValidPrice && !hasAnySpecEdited && (!price || price === 0)) {
      return 'not-started';
    }

    return 'incomplete';
  };

  // Worklist Accordion & Filter State
  const [itemFilter, setItemFilter] = useState<'all' | 'incomplete' | 'completed'>('all');

  // Expanded items Set
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const init = new Set<string>();
    if (itemsDetail.length === 1) {
      init.add(itemsDetail[0].item.id);
    } else if (itemsDetail.length > 1) {
      // Default expand item 4 (index 3) which is incomplete
      const targetItem = itemsDetail[3] || itemsDetail[0];
      init.add(targetItem.item.id);
    }
    return init;
  });

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Item counts for filter tabs & progress badge
  const itemStatusList = useMemo(() => {
    return itemsDetail.map((itemSel) => ({
      item: itemSel,
      status: getItemStatus(itemSel.item.id),
    }));
  }, [itemsDetail, unitPrices, vendorSpecs]);

  const completedCount = useMemo(() => {
    return itemStatusList.filter((item) => item.status === 'completed').length;
  }, [itemStatusList]);

  const incompleteCount = useMemo(() => {
    return itemStatusList.filter((item) => item.status !== 'completed').length;
  }, [itemStatusList]);

  const filteredItems = useMemo(() => {
    if (itemFilter === 'completed') {
      return itemStatusList.filter((i) => i.status === 'completed');
    }
    if (itemFilter === 'incomplete') {
      return itemStatusList.filter((i) => i.status !== 'completed');
    }
    return itemStatusList;
  }, [itemStatusList, itemFilter]);

  // Financial calculations
  const subtotal = useMemo(() => {
    return itemsDetail.reduce((acc, itemSel) => {
      const price = unitPrices[itemSel.item.id] || 0;
      return acc + price * itemSel.quantity;
    }, 0);
  }, [itemsDetail, unitPrices]);

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * taxRate);
  }, [subtotal, taxRate]);

  const totalAmount = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  // Submit Handler: Persists VendorQuotation to mockCompanyRFQs and localStorage
  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedQuoteNum = `AG-Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Construct standard VendorQuotation
      const newQuotation: VendorQuotation = {
        quotationNumber: generatedQuoteNum,
        vendorId: 'v-1',
        vendorName: CURRENT_VENDOR_NAME,
        submittedDate: dateStr,
        submittedTime: timeStr,
        quotedItems: itemsDetail.map((itemSel) => ({
          itemId: itemSel.item.id,
          itemName: itemSel.item.name,
          model: itemSel.item.model,
          quantity: itemSel.quantity,
          unit: itemSel.item.unit,
          unitPrice: unitPrices[itemSel.item.id] || 0,
          lineTotal: (unitPrices[itemSel.item.id] || 0) * itemSel.quantity,
        })),
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        deliveryTimeline: deliveryTimeline,
        paymentTerms: paymentTerms,
        validityDate: validityDate,
        vendorComments: vendorComments,
      };

      // 1. Update in-memory mockCompanyRFQs
      for (const companyGroup of Object.values(mockCompanyRFQs)) {
        const target = [...companyGroup.running, ...companyGroup.completed].find(
          (r) => r.id === rfqId
        );
        if (target) {
          if (!target.vendorResponses) target.vendorResponses = [];
          const existingIdx = target.vendorResponses.findIndex((vr) =>
            vr.vendorName.toLowerCase().includes(CURRENT_VENDOR_NAME.toLowerCase())
          );
          const responseObj: VendorResponse = {
            vendorId: 'v-1',
            vendorName: CURRENT_VENDOR_NAME,
            status: 'Quotation Received',
            quotationValue: totalAmount,
            submittedDate: dateStr,
            submittedTime: timeStr,
            quotation: newQuotation,
          };
          if (existingIdx >= 0) {
            target.vendorResponses[existingIdx] = responseObj;
          } else {
            target.vendorResponses.push(responseObj);
          }
        }
      }

      // 2. Persist in localStorage
      const meta = {
        quotationNumber: generatedQuoteNum,
        submittedDate: dateStr,
        submittedTime: timeStr,
        totalAmount: totalAmount,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`vp_quote_${rfqId}`, JSON.stringify(newQuotation));
          localStorage.setItem(`vp_quote_meta_${rfqId}`, JSON.stringify(meta));
        } catch (e) {
          // ignore
        }
      }

      setSubmittedQuoteMeta(meta);
      setIsSubmitting(false);
      setViewMode('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 850);
  };

  if (!rfq) {
    return (
      <div className="vp-placeholder-container">
        <AlertCircle size={36} color="#DC2626" />
        <h2 className="vp-placeholder-title">RFQ Not Found</h2>
        <p className="vp-placeholder-text">
          The requested RFQ record could not be found in the current workspace.
        </p>
        <Link href="/vendor-portal/rfq" className="vp-detail-back-btn">
          <ArrowLeft size={15} />
          <span>Back to RFQ Inbox</span>
        </Link>
      </div>
    );
  }

  // Determine status badge presentation
  const isClosed = rfq.status === 'Closed';
  const isApproved = existingVendorResponse?.status === 'Quotation Approved';
  const isSubmittedState = viewMode === 'submitted';

  let statusPillLabel = 'Awaiting Quotation';
  let statusBadgeClass = 'vp-status-badge--blue';

  if (isClosed) {
    statusPillLabel = 'Closed';
    statusBadgeClass = 'vp-status-badge--gray';
  } else if (isApproved) {
    statusPillLabel = 'Quote Approved';
    statusBadgeClass = 'vp-status-badge--purple';
  } else if (isSubmittedState) {
    statusPillLabel = 'Quote Submitted';
    statusBadgeClass = 'vp-status-badge--green';
  } else if (rfq.isUrgent || rfq.status === 'Closing Soon') {
    statusPillLabel = 'Closing Soon';
    statusBadgeClass = 'vp-status-badge--urgent';
  }

  return (
    <div className="vp-detail-wrapper">
      {/* Top Navigation Row */}
      <div className="vp-detail-nav">
        <Link href="/vendor-portal/rfq" className="vp-detail-back-btn">
          <ArrowLeft size={15} />
          <span>Back to RFQ Inbox</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW MODE: QUOTE ENTRY FORM */}
      {/* ========================================================================= */}
      {viewMode === 'entry' && (
        <>
          {/* RFQ Header Card */}
          <div className="vp-detail-header-card">
            <div className="vp-detail-header-card__top">
              <div>
                <div className="vp-detail-rfq-num-row">
                  <span className="vp-rfq-num-pill">{rfq.rfqNumber}</span>
                  <span className="vp-rfq-header__badge">{rfq.category}</span>
                </div>
                <div className="vp-detail-company-sub">
                  <Building2 size={14} />
                  <span>{rfq.company || 'Acme Technologies Pvt Ltd'}</span>
                </div>
                <h1 className="vp-detail-title">{rfq.title}</h1>
              </div>

              {/* Top-Right Badges */}
              <div className="vp-detail-header-badges">
                <span className={`vp-status-badge ${statusBadgeClass}`}>
                  <Clock size={13} />
                  <span>{statusPillLabel}</span>
                </span>
                {rfq.timeRemaining && !isClosed && (
                  <span className={`vp-deadline-pill ${rfq.isUrgent ? 'vp-deadline-pill--urgent' : ''}`}>
                    <Clock size={12} />
                    <span>{rfq.timeRemaining}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="vp-detail-meta-grid">
              <div className="vp-detail-meta-item">
                <span className="vp-detail-meta-label">
                  <Calendar size={12} />
                  <span>Received Date</span>
                </span>
                <span className="vp-detail-meta-value">{rfq.createdDate}</span>
              </div>

              <div className="vp-detail-meta-item">
                <span className="vp-detail-meta-label">
                  <Clock size={12} />
                  <span>Response Deadline</span>
                </span>
                <span className="vp-detail-meta-value">{rfq.deadlineDate}</span>
              </div>

              <div className="vp-detail-meta-item">
                <span className="vp-detail-meta-label">
                  <AlertCircle size={12} />
                  <span>Time Remaining</span>
                </span>
                <span
                  className="vp-detail-meta-value"
                  style={{ color: rfq.isUrgent ? '#DC2626' : '#0F172A', fontWeight: rfq.isUrgent ? 700 : 600 }}
                >
                  {rfq.timeRemaining}
                </span>
              </div>

              <div className="vp-detail-meta-item">
                <span className="vp-detail-meta-label">
                  <MapPin size={12} />
                  <span>Delivery Location</span>
                </span>
                <span className="vp-detail-meta-value">
                  {rfq.deliveryLocation || 'DataTwin Bangalore Tech Park — Logistics Hub'}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="vp-detail-divider" />

            {/* Integrated Buyer Commercial Instructions */}
            <div className="vp-header-buyer-terms">
              <div className="vp-header-buyer-terms__title">
                <div className="vp-header-buyer-terms__title-left">
                  <Lock size={14} color="#4F46E5" />
                  <span>Buyer Commercial Instructions &amp; Terms</span>
                </div>
                <span className="vp-header-buyer-terms__tag">
                  <Lock size={10} />
                  <span>Read-Only</span>
                </span>
              </div>
              <div className="vp-header-buyer-terms__content">
                {rfq.notes ||
                  'Please include standard 3-year enterprise OEM warranty, GST breakout, volume discounting, and on-site hardware support in commercial quotation. Original specifications must be adhered to unless explicit alternatives are proposed.'}
              </div>
            </div>
          </div>

          {/* Requested Items Worklist Section */}
          <div className="vp-worklist-section">
            <div className="vp-worklist-header">
              <div className="vp-worklist-title-row">
                <h2 className="vp-worklist-title">Requested Items</h2>
                <span className="vp-worklist-progress-badge">
                  <Check size={12} strokeWidth={2.5} />
                  <span>{completedCount} of {itemsDetail.length} items completed</span>
                </span>
              </div>

              {/* Worklist Filters */}
              <div className="vp-worklist-filters">
                <button
                  type="button"
                  onClick={() => setItemFilter('all')}
                  className={`vp-worklist-filter-btn ${itemFilter === 'all' ? 'vp-worklist-filter-btn--active' : ''}`}
                >
                  All ({itemsDetail.length})
                </button>
                <button
                  type="button"
                  onClick={() => setItemFilter('incomplete')}
                  className={`vp-worklist-filter-btn ${itemFilter === 'incomplete' ? 'vp-worklist-filter-btn--active' : ''}`}
                >
                  Incomplete ({incompleteCount})
                </button>
                <button
                  type="button"
                  onClick={() => setItemFilter('completed')}
                  className={`vp-worklist-filter-btn ${itemFilter === 'completed' ? 'vp-worklist-filter-btn--active' : ''}`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Scalable Accordion Item List */}
            <div className="vp-accordion-list">
              {filteredItems.map(({ item: itemSel, status }) => {
                const itemIdx = itemsDetail.findIndex((i) => i.item.id === itemSel.item.id);
                const isExpanded = expandedItems.has(itemSel.item.id);
                const currentItemUnitPrice = unitPrices[itemSel.item.id] || 0;
                const currentItemLineTotal = currentItemUnitPrice * itemSel.quantity;

                let statusIcon = <Circle size={14} />;
                let statusIconClass = 'vp-accordion-status-icon--not-started';
                let statusPillText = 'Not Started';
                let statusPillClass = 'vp-item-status-pill--not-started';

                if (status === 'completed') {
                  statusIcon = <Check size={14} strokeWidth={3} />;
                  statusIconClass = 'vp-accordion-status-icon--completed';
                  statusPillText = 'Completed';
                  statusPillClass = 'vp-item-status-pill--completed';
                } else if (status === 'incomplete') {
                  statusIcon = <AlertTriangle size={14} strokeWidth={2.5} />;
                  statusIconClass = 'vp-accordion-status-icon--incomplete';
                  statusPillText = 'Incomplete';
                  statusPillClass = 'vp-item-status-pill--incomplete';
                }

                return (
                  <div
                    key={itemSel.item.id}
                    className={`vp-accordion-item ${isExpanded ? 'vp-accordion-item--expanded' : ''}`}
                  >
                    {/* Collapsed Header Bar */}
                    <div
                      className="vp-accordion-header"
                      onClick={() => toggleItemExpansion(itemSel.item.id)}
                    >
                      <div className="vp-accordion-header__left">
                        <div className={`vp-accordion-status-icon ${statusIconClass}`}>
                          {statusIcon}
                        </div>

                        <span className="vp-accordion-index-badge">
                          {String(itemIdx + 1).padStart(2, '0')}
                        </span>

                        <div className="vp-accordion-item-info">
                          <div className="vp-accordion-item-title-row">
                            <span className="vp-accordion-item-name">{itemSel.item.name}</span>
                            <span className="vp-item-tag">{itemSel.item.category}</span>
                          </div>
                          <div className="vp-accordion-item-sub">
                            <span>Model: <strong>{itemSel.item.model}</strong></span>
                            <span>•</span>
                            <span>Qty: <strong>{itemSel.quantity} {itemSel.item.unit}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="vp-accordion-header__right">
                        {currentItemUnitPrice > 0 && (
                          <div className="vp-accordion-pricing-preview">
                            <span className="vp-accordion-pricing-label">Line Total</span>
                            <span className="vp-accordion-pricing-val">
                              ₹{currentItemLineTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        <span className={`vp-item-status-pill ${statusPillClass}`}>
                          {statusPillText}
                        </span>

                        <button
                          type="button"
                          className="vp-accordion-toggle-btn"
                          aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="vp-accordion-body">
                        <div className="vp-specs-table-container">
                          <table className="vp-specs-table">
                            <thead>
                              <tr>
                                <th className="vp-spec-key-col">Specification</th>
                                <th className="vp-spec-buyer-col">
                                  Buyer Requirement (Read-Only)
                                </th>
                                <th className="vp-spec-vendor-col">
                                  Vendor Quoted Specification (Editable)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemSel.specifications.map((spec) => {
                                const currentVendorSpec =
                                  vendorSpecs[itemSel.item.id]?.[spec.id] || {
                                    vendorValue: spec.value,
                                    note: '',
                                  };

                                const isNoteOpen =
                                  activeNoteTarget?.itemId === itemSel.item.id &&
                                  activeNoteTarget?.specId === spec.id;

                                const hasSavedNote = Boolean(currentVendorSpec.note);

                                return (
                                  <tr key={spec.id}>
                                    <td className="vp-spec-key-col">
                                      <span>{spec.key}</span>
                                    </td>

                                    <td className="vp-spec-buyer-col">
                                      <span className="vp-buyer-spec-text">
                                        <Lock size={12} color="#94A3B8" />
                                        {spec.value}
                                      </span>
                                    </td>

                                    <td className="vp-spec-vendor-col">
                                      <div className="vp-vendor-spec-input-wrapper">
                                        <input
                                          type="text"
                                          value={currentVendorSpec.vendorValue}
                                          onChange={(e) =>
                                            handleSpecChange(
                                              itemSel.item.id,
                                              spec.id,
                                              e.target.value
                                            )
                                          }
                                          className="vp-vendor-spec-input"
                                          placeholder="Enter vendor quoted spec..."
                                        />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenNoteEditor(itemSel.item.id, spec.id);
                                          }}
                                          className={`vp-spec-note-btn ${
                                            hasSavedNote ? 'vp-spec-note-btn--has-note' : ''
                                          }`}
                                          title={hasSavedNote ? 'Edit note' : 'Add specification note/justification'}
                                        >
                                          <MessageSquare size={14} />
                                        </button>
                                      </div>

                                      {hasSavedNote && (
                                        <div className="vp-spec-note-saved-pill">
                                          <span>Note: {currentVendorSpec.note}</span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenNoteEditor(itemSel.item.id, spec.id);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            title="Edit Note"
                                          >
                                            <Edit3 size={11} color="#166534" />
                                          </button>
                                        </div>
                                      )}

                                      {isNoteOpen && (
                                        <div
                                          className="vp-spec-note-popover"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4F46E5' }}>
                                            Add Note for &ldquo;{spec.key}&rdquo;
                                          </span>
                                          <textarea
                                            value={noteDraft}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            placeholder="e.g. 9th Gen is unavailable; quoting 11th Gen equivalent..."
                                            className="vp-spec-note-textarea"
                                            autoFocus
                                          />
                                          <div className="vp-spec-note-actions">
                                            <button
                                              type="button"
                                              onClick={() => setActiveNoteTarget(null)}
                                              className="vp-btn-secondary"
                                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="button"
                                              onClick={handleSaveNote}
                                              className="vp-btn-primary-action"
                                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                                            >
                                              Save Note
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pricing Inputs */}
                        <div className="vp-pricing-box">
                          <div className="vp-pricing-field">
                            <span className="vp-pricing-field__label">
                              Quoted Unit Price (INR)
                            </span>
                            <div className="vp-pricing-input-wrap">
                              <span style={{ color: '#64748B', fontWeight: 600 }}>₹</span>
                              <input
                                type="number"
                                value={currentItemUnitPrice || ''}
                                onChange={(e) =>
                                  setUnitPrices((prev) => ({
                                    ...prev,
                                    [itemSel.item.id]: Number(e.target.value) || 0,
                                  }))
                                }
                                placeholder="0"
                                className="vp-pricing-input"
                              />
                            </div>
                          </div>

                          <div className="vp-line-total-box">
                            <span className="vp-line-total-label">
                              Line Total ({itemSel.quantity} {itemSel.item.unit})
                            </span>
                            <span className="vp-line-total-value">
                              ₹{currentItemLineTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commercial Terms & Financial Breakdown Grid */}
          <div className="vp-bottom-grid">
            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <Truck size={18} color="#4F46E5" />
                <span>Commercial Terms &amp; Conditions</span>
              </h3>

              <div className="vp-form-grid-2">
                <div className="vp-form-group">
                  <label className="vp-form-label">Delivery Timeline</label>
                  <input
                    type="text"
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(e.target.value)}
                    className="vp-form-input"
                    placeholder="e.g. 14 Business Days"
                  />
                </div>

                <div className="vp-form-group">
                  <label className="vp-form-label">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="vp-form-input"
                    placeholder="e.g. Net 30 Days"
                  />
                </div>
              </div>

              <div className="vp-form-group">
                <label className="vp-form-label">Quotation Validity</label>
                <input
                  type="text"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  className="vp-form-input"
                  placeholder="e.g. 30 Days from submission"
                />
              </div>

              <div className="vp-form-group">
                <label className="vp-form-label">General Remarks &amp; Vendor Comments</label>
                <textarea
                  value={vendorComments}
                  onChange={(e) => setVendorComments(e.target.value)}
                  className="vp-form-textarea"
                  placeholder="Include warranty details, transit insurance, or logistics terms..."
                />
              </div>
            </div>

            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <CreditCard size={18} color="#4F46E5" />
                <span>Financial Breakdown</span>
              </h3>

              <div className="vp-financial-rows">
                <div className="vp-financial-row">
                  <span>Subtotal (Excl. Taxes):</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>

                <div className="vp-financial-row">
                  <span>GST / Tax Rate:</span>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="vp-form-select"
                    style={{ width: '120px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    <option value={0.18}>18% GST</option>
                    <option value={0.12}>12% GST</option>
                    <option value={0.05}>5% GST</option>
                    <option value={0}>0% Tax Exempt</option>
                  </select>
                </div>

                <div className="vp-financial-row">
                  <span>Estimated Tax Amount:</span>
                  <strong>₹{taxAmount.toLocaleString('en-IN')}</strong>
                </div>

                <div className="vp-financial-divider" />

                <div className="vp-financial-total-row">
                  <span>Total Quotation Value:</span>
                  <span className="vp-financial-total-amount">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="vp-action-bar">
            <Link href="/vendor-portal/rfq" className="vp-btn-secondary">
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => {
                setViewMode('review');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="vp-btn-primary-action"
            >
              <span>Review Quotation &rarr;</span>
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW MODE: DEDICATED REVIEW STATE */}
      {/* ========================================================================= */}
      {viewMode === 'review' && (
        <div className="vp-detail-wrapper" style={{ padding: 0 }}>
          {/* Review Header Card */}
          <div className="vp-review-header-card">
            <div>
              <span className="vp-review-stepper-pill">
                <FileCheck size={12} />
                <span>Final Review &amp; Pre-Submission</span>
              </span>
              <h2 className="vp-review-title">Review Your Quotation Response</h2>
              <p className="vp-review-sub">
                Please review all quoted specifications, unit prices, and commercial terms before submitting to {rfq.company || 'the buyer'}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('entry');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="vp-btn-secondary"
            >
              <Edit3 size={14} />
              <span>Back to Edit</span>
            </button>
          </div>

          {/* RFQ Summary Card */}
          <div className="vp-review-rfq-summary-card">
            <div className="vp-review-rfq-summary-top">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="vp-rfq-num-pill">{rfq.rfqNumber}</span>
                  <span className="vp-rfq-header__badge">{rfq.category}</span>
                </div>
                <h3 className="vp-review-rfq-title">{rfq.title}</h3>
              </div>
              <div className="vp-detail-company-sub">
                <Building2 size={14} />
                <span>{rfq.company || 'Acme Technologies Pvt Ltd'}</span>
              </div>
            </div>

            <div className="vp-review-rfq-meta">
              <span><strong>Deadline:</strong> {rfq.deadlineDate}</span>
              <span>•</span>
              <span><strong>Items:</strong> {itemsDetail.length} ({rfq.totalQuantity} Units)</span>
              <span>•</span>
              <span><strong>Delivery:</strong> {rfq.deliveryLocation || 'Bangalore Tech Park'}</span>
            </div>
          </div>

          {/* Review of Line Items & Specs */}
          {itemsDetail.map((itemSel, idx) => {
            const price = unitPrices[itemSel.item.id] || 0;
            const lineTotal = price * itemSel.quantity;

            return (
              <div key={itemSel.item.id || idx} className="vp-item-card">
                <div className="vp-item-card__header">
                  <div>
                    <h3 className="vp-item-card__name">
                      {idx + 1}. {itemSel.item.name} ({itemSel.quantity} {itemSel.item.unit})
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Model: <strong>{itemSel.item.model}</strong> · Quoted Unit Price: <strong>₹{price.toLocaleString('en-IN')}</strong> · Line Total: <strong style={{ color: '#4F46E5' }}>₹{lineTotal.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>

                {/* Specs Review Table */}
                <div className="vp-specs-table-container">
                  <table className="vp-specs-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Specification</th>
                        <th style={{ width: '35%' }}>Buyer Requirement (Read-Only)</th>
                        <th style={{ width: '40%' }}>Vendor Quoted Specification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemSel.specifications.map((spec) => {
                        const vSpec = vendorSpecs[itemSel.item.id]?.[spec.id] || {
                          vendorValue: spec.value,
                          note: '',
                        };

                        const isDifferent = vSpec.vendorValue !== spec.value;

                        return (
                          <tr key={spec.id}>
                            <td className="vp-spec-key-col">{spec.key}</td>
                            <td className="vp-spec-buyer-col">
                              <span className="vp-buyer-spec-text">
                                <Lock size={12} color="#94A3B8" />
                                {spec.value}
                              </span>
                            </td>
                            <td className="vp-spec-vendor-col">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <strong style={{ color: isDifferent ? '#4F46E5' : '#0F172A' }}>
                                  {vSpec.vendorValue || spec.value}
                                </strong>
                                {isDifferent && (
                                  <span style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700, background: '#EEF2FF', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid #C7D2FE' }}>
                                    Vendor Alternate
                                  </span>
                                )}
                              </div>
                              {vSpec.note && (
                                <div className="vp-spec-note-saved-pill" style={{ marginTop: '0.35rem' }}>
                                  <span>Note: {vSpec.note}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Commercial & Financial Summary in Review */}
          <div className="vp-bottom-grid">
            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <Truck size={17} color="#4F46E5" />
                <span>Commercial Terms &amp; Conditions</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748B' }}>Delivery Timeline:</span> <strong>{deliveryTimeline}</strong></div>
                <div><span style={{ color: '#64748B' }}>Payment Terms:</span> <strong>{paymentTerms}</strong></div>
                <div><span style={{ color: '#64748B' }}>Quotation Validity:</span> <strong>{validityDate}</strong></div>
                <div><span style={{ color: '#64748B' }}>Vendor Remarks:</span> <p style={{ marginTop: '0.2rem', color: '#334155', lineHeight: 1.5 }}>{vendorComments || 'None'}</p></div>
              </div>
            </div>

            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <CreditCard size={17} color="#4F46E5" />
                <span>Financial Total</span>
              </h3>
              <div className="vp-financial-rows">
                <div className="vp-financial-row">
                  <span>Subtotal (Excl. Taxes):</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="vp-financial-row">
                  <span>GST Tax ({taxRate * 100}%):</span>
                  <strong>₹{taxAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="vp-financial-divider" />
                <div className="vp-financial-total-row">
                  <span>Total Quotation Value:</span>
                  <span className="vp-financial-total-amount">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="vp-action-bar">
            <button
              type="button"
              onClick={() => {
                setViewMode('entry');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="vp-btn-secondary"
            >
              <ArrowLeft size={14} />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="vp-btn-primary-action"
            >
              {isSubmitting ? (
                <span>Transmitting Quotation...</span>
              ) : (
                <>
                  <span>Submit Quotation</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW MODE: SUBMITTED CONFIRMATION STATE (READ-ONLY) */}
      {/* ========================================================================= */}
      {viewMode === 'submitted' && (
        <div className="vp-detail-wrapper" style={{ padding: 0 }}>
          {/* Submitted Banner */}
          <div className="vp-submitted-banner">
            <div className="vp-submitted-banner__icon">
              <CheckCircle2 size={30} />
            </div>
            <div className="vp-submitted-banner__content">
              <h2 className="vp-submitted-banner__title">Quotation Submitted Successfully!</h2>
              <p className="vp-submitted-banner__desc">
                Your quotation <strong>{submittedQuoteMeta?.quotationNumber || 'AG-Q-2026-1024'}</strong> has been officially transmitted to <strong>{rfq.company || 'Buyer Organization'}</strong>. All pricing and proposed specifications are now recorded and read-only.
              </p>
            </div>
          </div>

          {/* Submission Summary Metadata Grid Card */}
          <div className="vp-submitted-summary-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Official Quotation Submission Record</span>
            </h3>

            <div className="vp-submitted-grid">
              <div className="vp-submitted-grid-item">
                <span className="vp-submitted-grid-label">Quotation Number</span>
                <span className="vp-submitted-grid-value" style={{ color: '#4F46E5' }}>
                  {submittedQuoteMeta?.quotationNumber || 'AG-Q-2026-1024'}
                </span>
              </div>

              <div className="vp-submitted-grid-item">
                <span className="vp-submitted-grid-label">RFQ Reference</span>
                <span className="vp-submitted-grid-value">{rfq.rfqNumber}</span>
              </div>

              <div className="vp-submitted-grid-item">
                <span className="vp-submitted-grid-label">Submitted On</span>
                <span className="vp-submitted-grid-value">
                  {submittedQuoteMeta?.submittedDate || 'Today'} at {submittedQuoteMeta?.submittedTime || '12:00 PM'}
                </span>
              </div>

              <div className="vp-submitted-grid-item">
                <span className="vp-submitted-grid-label">Total Quotation Value</span>
                <span className="vp-submitted-grid-value" style={{ color: '#059669' }}>
                  ₹{(submittedQuoteMeta?.totalAmount || totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Read-Only Items Breakdown */}
          {itemsDetail.map((itemSel, idx) => {
            const price = unitPrices[itemSel.item.id] || 0;
            const lineTotal = price * itemSel.quantity;

            return (
              <div key={itemSel.item.id || idx} className="vp-item-card">
                <div className="vp-item-card__header">
                  <div>
                    <h3 className="vp-item-card__name">
                      {idx + 1}. {itemSel.item.name} ({itemSel.quantity} {itemSel.item.unit})
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Model: <strong>{itemSel.item.model}</strong> · Quoted Unit Price: <strong>₹{price.toLocaleString('en-IN')}</strong> · Line Total: <strong style={{ color: '#059669' }}>₹{lineTotal.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                  <span className="vp-item-status-pill vp-item-status-pill--completed">
                    ✓ Recorded
                  </span>
                </div>

                <div className="vp-specs-table-container">
                  <table className="vp-specs-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Specification</th>
                        <th style={{ width: '35%' }}>Buyer Requirement (Read-Only)</th>
                        <th style={{ width: '40%' }}>Vendor Quoted Specification (Final)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemSel.specifications.map((spec) => {
                        const vSpec = vendorSpecs[itemSel.item.id]?.[spec.id] || {
                          vendorValue: spec.value,
                          note: '',
                        };

                        const isDifferent = vSpec.vendorValue !== spec.value;

                        return (
                          <tr key={spec.id}>
                            <td className="vp-spec-key-col">{spec.key}</td>
                            <td className="vp-spec-buyer-col">
                              <span className="vp-buyer-spec-text">
                                <Lock size={12} color="#94A3B8" />
                                {spec.value}
                              </span>
                            </td>
                            <td className="vp-spec-vendor-col">
                              <strong style={{ color: isDifferent ? '#4F46E5' : '#0F172A' }}>
                                {vSpec.vendorValue || spec.value}
                              </strong>
                              {isDifferent && (
                                <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700, background: '#EEF2FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  Vendor Alternate
                                </span>
                              )}
                              {vSpec.note && (
                                <div className="vp-spec-note-saved-pill" style={{ marginTop: '0.25rem' }}>
                                  <span>Note: {vSpec.note}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Submitted Commercial Terms & Financials */}
          <div className="vp-bottom-grid">
            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <Truck size={17} color="#4F46E5" />
                <span>Submitted Commercial Terms</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748B' }}>Delivery Timeline:</span> <strong>{deliveryTimeline}</strong></div>
                <div><span style={{ color: '#64748B' }}>Payment Terms:</span> <strong>{paymentTerms}</strong></div>
                <div><span style={{ color: '#64748B' }}>Quotation Validity:</span> <strong>{validityDate}</strong></div>
                <div><span style={{ color: '#64748B' }}>Vendor Remarks:</span> <p style={{ marginTop: '0.2rem', color: '#334155', lineHeight: 1.5 }}>{vendorComments || 'None'}</p></div>
              </div>
            </div>

            <div className="vp-card-section">
              <h3 className="vp-card-section__title">
                <CreditCard size={17} color="#4F46E5" />
                <span>Submitted Financial Total</span>
              </h3>
              <div className="vp-financial-rows">
                <div className="vp-financial-row">
                  <span>Subtotal (Excl. Taxes):</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="vp-financial-row">
                  <span>Tax ({taxRate * 100}% GST):</span>
                  <strong>₹{taxAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="vp-financial-divider" />
                <div className="vp-financial-total-row">
                  <span>Total Quotation Amount:</span>
                  <span className="vp-financial-total-amount" style={{ color: '#059669' }}>
                    ₹{(submittedQuoteMeta?.totalAmount || totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Action Row */}
          <div className="vp-action-bar">
            <Link href="/vendor-portal/rfq" className="vp-btn-primary-action">
              <ArrowLeft size={15} />
              <span>Back to RFQ Inbox</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
