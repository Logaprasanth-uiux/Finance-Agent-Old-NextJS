"use client";

import React, { useState, useMemo } from 'react';
import type { RFQRecord, VendorResponse } from '../../types/rfq';
import {
  mockLaptopSpecificationGroups,
  mockLaptopCommercialQuotations,
  type SpecificationComparisonRow,
  type VendorCommercialQuotation,
} from '../../data/laptopComparisonData';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Edit3,
  Trash2,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  Award,
  DollarSign,
  Truck,
  Shield,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';

interface RFQComparativeViewProps {
  rfq: RFQRecord;
  vendorResponses: VendorResponse[];
  onApproveVendor: (vendorName: string) => void;
  onViewQuotationModal?: (vendorName: string) => void;
}

export const RFQComparativeView: React.FC<RFQComparativeViewProps> = ({
  rfq,
  vendorResponses,
  onApproveVendor,
}) => {
  // Active category filter: 'all' or category id
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Expand / Collapse State for Category Groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Buyer Notes per specification row: rowId -> note string
  const [buyerNotes, setBuyerNotes] = useState<Record<string, string>>({
    'spec-1-1': 'ABC Digital offers Core i7-13650HX with higher performance multicore profile.',
    'spec-2-5': 'ABC Digital provides 1TB SSD capacity (double the baseline requirement).',
    'spec-4-6': 'ABC Digital (144Hz) and Demo Tech (165Hz) exceed the 120Hz baseline requirement.',
  });

  // Inline editing state for row notes: rowId -> boolean
  const [editingNoteRowId, setEditingNoteRowId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Overall Remarks state
  const [overallRemarks, setOverallRemarks] = useState<string>(
    'Prime Assemblies Inc and ABC Digital both meet our primary enterprise requirements with RTX 4060 graphics and 3 Years On-site Warranty. ABC Digital is evaluated favorably for double storage capacity (1TB) and 144Hz panel at the lowest overall quotation value.'
  );

  // Vendor Selection state
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState<string>(
    'Prime Assemblies Inc'
  );

  // Confirmation Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isApprovalSuccess, setIsApprovalSuccess] = useState<boolean>(false);

  // Available vendors in this RFQ
  const availableVendors = useMemo(() => {
    const defaultList = [
      'Prime Assemblies Inc',
      'ABC Digital Private Limited',
      'Demo Technologies Private Limited',
    ];
    if (vendorResponses && vendorResponses.length > 0) {
      const respVendors = vendorResponses
        .map((vr) => vr.vendorName)
        .filter(Boolean);
      // Merge unique
      const merged = Array.from(new Set([...defaultList, ...respVendors]));
      return merged.filter((v) => defaultList.includes(v) || mockLaptopCommercialQuotations[v]);
    }
    return defaultList;
  }, [vendorResponses]);

  // Check if a vendor is currently approved
  const approvedVendor = useMemo(() => {
    return vendorResponses.find((vr) => vr.status === 'Quotation Approved');
  }, [vendorResponses]);

  // Toggle collapse for a group
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const expandAllGroups = () => {
    setCollapsedGroups({});
  };

  const collapseAllGroups = () => {
    const allCollapsed: Record<string, boolean> = {};
    mockLaptopSpecificationGroups.forEach((g) => {
      allCollapsed[g.id] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  // Note management
  const handleStartEditNote = (rowId: string, currentNote = '') => {
    setEditingNoteRowId(rowId);
    setTempNoteText(currentNote || buyerNotes[rowId] || '');
  };

  const handleSaveNote = (rowId: string) => {
    if (tempNoteText.trim()) {
      setBuyerNotes((prev) => ({
        ...prev,
        [rowId]: tempNoteText.trim(),
      }));
    } else {
      setBuyerNotes((prev) => {
        const copy = { ...prev };
        delete copy[rowId];
        return copy;
      });
    }
    setEditingNoteRowId(null);
    setTempNoteText('');
  };

  const handleDeleteNote = (rowId: string) => {
    setBuyerNotes((prev) => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });
    if (editingNoteRowId === rowId) {
      setEditingNoteRowId(null);
      setTempNoteText('');
    }
  };

  // Filter groups and rows
  const filteredGroups = useMemo(() => {
    return mockLaptopSpecificationGroups
      .filter((group) => {
        if (selectedCategory === 'all') return true;
        return group.id === selectedCategory;
      })
      .map((group) => {
        const filteredRows = group.rows.filter((row) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const matchFeature = row.feature.toLowerCase().includes(q);
          const matchReq = row.detailRequirement.toLowerCase().includes(q);
          const matchResp = Object.values(row.responses).some((r) =>
            r.toLowerCase().includes(q)
          );
          const matchNote = buyerNotes[row.id]?.toLowerCase().includes(q);
          return matchFeature || matchReq || matchResp || matchNote;
        });

        return {
          ...group,
          rows: filteredRows,
        };
      })
      .filter((group) => group.rows.length > 0);
  }, [selectedCategory, searchQuery, buyerNotes]);

  const totalAllSpecs = useMemo(() => {
    return mockLaptopSpecificationGroups.reduce((acc, g) => acc + g.rows.length, 0);
  }, []);

  const totalFilteredSpecs = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.rows.length, 0);
  }, [filteredGroups]);

  // Handle final approval from review modal
  const handleConfirmApproval = () => {
    onApproveVendor(selectedVendorForApproval);
    setIsReviewModalOpen(false);
    setIsApprovalSuccess(true);
    setTimeout(() => {
      setIsApprovalSuccess(false);
    }, 4000);
  };

  const selectedCommercialQuote =
    mockLaptopCommercialQuotations[selectedVendorForApproval] ||
    mockLaptopCommercialQuotations['Prime Assemblies Inc'];

  return (
    <div className="rfq-comparative-container">
      {/* 1. Header Card with RFQ Summary */}
      <div className="rfq-comparative-header-card">
        <div className="rfq-comparative-header-main">
          <div className="rfq-comparative-header-left">
            <div className="rfq-detail-num-row">
              <span className="rfq-detail-num">{rfq.rfqNumber || 'RFQ-2026-0088'}</span>
              <span className="rfq-comparative-badge">
                <FileSpreadsheet size={13} />
                Comparative Evaluation Matrix
              </span>
              {approvedVendor && (
                <span className="rfq-resp-pill rfq-resp-pill--approved">
                  <ShieldCheck size={12} />
                  Awarded: {approvedVendor.vendorName}
                </span>
              )}
            </div>
            <h2 className="rfq-comparative-title">
              {rfq.title || 'Dell Commercial Laptops Enterprise Procurement'}
            </h2>
            <p className="rfq-comparative-subtitle">
              Comprehensive side-by-side technical specification alignment and commercial proposal evaluation for <strong>{rfq.itemsSummary || 'Dell Commercial Laptop (20 Nos)'}</strong>.
            </p>
          </div>

          <div className="rfq-comparative-header-meta">
            <div className="rfq-comp-meta-item">
              <span className="rfq-comp-meta-label">Issuing Entity</span>
              <span className="rfq-comp-meta-value">
                <Building2 size={14} className="rfq-icon-indigo" />
                {rfq.company || 'Acme Technologies Pvt Ltd'}
              </span>
            </div>
            <div className="rfq-comp-meta-item">
              <span className="rfq-comp-meta-label">Response Deadline</span>
              <span className="rfq-comp-meta-value">
                <Calendar size={14} className="rfq-icon-indigo" />
                {rfq.deadlineDate || '30 Aug 2026'}
              </span>
            </div>
            <div className="rfq-comp-meta-item">
              <span className="rfq-comp-meta-label">Submissions</span>
              <span className="rfq-comp-meta-value rfq-comp-meta-value--highlight">
                <Layers size={14} />
                3 of 3 Vendor Responses
              </span>
            </div>
          </div>
        </div>

        {/* Success toast after confirmation */}
        {isApprovalSuccess && (
          <div className="rfq-approval-success-alert">
            <CheckCircle2 size={18} />
            <div>
              <strong>Vendor Approved Successfully!</strong>
              <span>
                {selectedVendorForApproval} has been officially recorded as the approved vendor for RFQ {rfq.rfqNumber}.
              </span>
            </div>
          </div>
        )}

        {/* Quick KPI Strip */}
        <div className="rfq-comparative-kpi-strip">
          <div className="rfq-kpi-card">
            <span className="rfq-kpi-title">Total Specifications</span>
            <div className="rfq-kpi-value-row">
              <span className="rfq-kpi-num">{totalAllSpecs}</span>
              <span className="rfq-kpi-sub">Across {mockLaptopSpecificationGroups.length} Technical Categories</span>
            </div>
          </div>
          <div className="rfq-kpi-card">
            <span className="rfq-kpi-title">Quotation Price Spread</span>
            <div className="rfq-kpi-value-row">
              <span className="rfq-kpi-num">₹16.05L – ₹22.18L</span>
              <span className="rfq-kpi-sub">Lowest: ABC Digital (₹16.05L)</span>
            </div>
          </div>
          <div className="rfq-kpi-card">
            <span className="rfq-kpi-title">Lead Time Range</span>
            <div className="rfq-kpi-value-row">
              <span className="rfq-kpi-num">3 to 10 Days</span>
              <span className="rfq-kpi-sub">Fastest: Demo Tech (3-5 Days)</span>
            </div>
          </div>
          <div className="rfq-kpi-card">
            <span className="rfq-kpi-title">Buyer Specification Notes</span>
            <div className="rfq-kpi-value-row">
              <span className="rfq-kpi-num">{Object.keys(buyerNotes).length} Notes</span>
              <span className="rfq-kpi-sub">Annotated on spec rows</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Filter Categories, Search, Expand/Collapse */}
      <div className="rfq-comparative-controls-bar">
        <div className="rfq-comp-search-wrap">
          <Search size={16} className="rfq-comp-search-icon" />
          <input
            type="text"
            placeholder="Search specifications, vendor responses, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rfq-comp-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="rfq-comp-search-clear"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="rfq-comp-category-pills">
          <button
            type="button"
            className={`rfq-category-pill ${selectedCategory === 'all' ? 'rfq-category-pill--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Specs ({totalAllSpecs})
          </button>
          {mockLaptopSpecificationGroups.map((grp) => (
            <button
              key={grp.id}
              type="button"
              className={`rfq-category-pill ${selectedCategory === grp.id ? 'rfq-category-pill--active' : ''}`}
              onClick={() => setSelectedCategory(grp.id)}
            >
              {grp.name} ({grp.rows.length})
            </button>
          ))}
        </div>

        <div className="rfq-comp-expand-controls">
          <button
            type="button"
            onClick={expandAllGroups}
            className="rfq-btn rfq-btn--xs rfq-btn--subtle"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAllGroups}
            className="rfq-btn rfq-btn--xs rfq-btn--subtle"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 3. Main Specification Comparison Matrix */}
      <div className="rfq-comparative-matrix-card">
        <div className="rfq-comparative-matrix-header">
          <div className="rfq-comp-section-title-wrap">
            <h3 className="rfq-comp-section-title">
              <Layers size={17} className="rfq-icon-indigo" />
              <span>Technical Specification Alignment</span>
            </h3>
            <span className="rfq-comp-count-badge">
              Showing {totalFilteredSpecs} of {totalAllSpecs} Parameters
            </span>
          </div>
          <p className="rfq-comp-section-sub">
            The Buyer Requirement column represents the immutable reference specification. Vendor responses indicate exact quoted configurations.
          </p>
        </div>

        <div className="rfq-matrix-table-container">
          <table className="rfq-matrix-table">
            <thead>
              <tr className="rfq-matrix-sticky-header">
                <th className="rfq-th rfq-th--feature" style={{ width: '18%' }}>
                  Specification Feature
                </th>
                <th className="rfq-th rfq-th--buyer-req" style={{ width: '24%' }}>
                  <div className="rfq-th-buyer-inner">
                    <span className="rfq-buyer-col-tag">Reference Baseline</span>
                    <strong>Buyer Requirement</strong>
                  </div>
                </th>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  const isSelected = selectedVendorForApproval === vendorName;
                  const isApproved = approvedVendor?.vendorName === vendorName;

                  return (
                    <th
                      key={vendorName}
                      className={`rfq-th rfq-th--vendor ${
                        isSelected ? 'rfq-th--vendor-selected' : ''
                      } ${isApproved ? 'rfq-th--vendor-approved' : ''}`}
                      style={{ width: '19%' }}
                    >
                      <div className="rfq-vendor-col-header">
                        <div className="rfq-vendor-col-header__top">
                          <div
                            className="rfq-vendor-avatar-sm"
                            style={{ backgroundColor: quote?.logoColor || '#4F46E5' }}
                          >
                            {quote?.logoInitial || vendorName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="rfq-vendor-col-name">{vendorName}</h4>
                            <span className="rfq-vendor-col-loc">
                              {quote?.location || 'India'}
                            </span>
                          </div>
                        </div>

                        <div className="rfq-vendor-col-header__pricing">
                          <span className="rfq-vendor-col-price">
                            ₹{quote?.totalAmount.toLocaleString('en-IN') || '19,47,000'}
                          </span>
                          <span className="rfq-vendor-col-price-sub">
                            ₹{quote?.unitPrice.toLocaleString('en-IN')}/unit + GST
                          </span>
                        </div>

                        <div className="rfq-vendor-col-header__action">
                          {isApproved ? (
                            <span className="rfq-approved-tag-header">
                              <ShieldCheck size={12} /> Approved
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={`rfq-btn rfq-btn--xs ${
                                isSelected ? 'rfq-btn--primary' : 'rfq-btn--outline'
                              }`}
                              onClick={() => setSelectedVendorForApproval(vendorName)}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedGroups[group.id];

                return (
                  <React.Fragment key={group.id}>
                    {/* Category Group Header Row */}
                    <tr
                      className="rfq-matrix-group-row"
                      onClick={() => toggleGroupCollapse(group.id)}
                    >
                      <td colSpan={2 + availableVendors.length}>
                        <div className="rfq-matrix-group-cell">
                          <div className="rfq-matrix-group-title">
                            {isCollapsed ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronUp size={16} />
                            )}
                            <strong>{group.name}</strong>
                            <span className="rfq-matrix-group-count">
                              ({group.rows.length} parameter{group.rows.length > 1 ? 's' : ''})
                            </span>
                          </div>
                          <span className="rfq-matrix-group-desc">
                            {group.description}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Group Specification Rows */}
                    {!isCollapsed &&
                      group.rows.map((row) => {
                        const hasNote = Boolean(buyerNotes[row.id]);
                        const isEditingNote = editingNoteRowId === row.id;

                        return (
                          <React.Fragment key={row.id}>
                            <tr
                              className={`rfq-matrix-data-row ${
                                hasNote ? 'rfq-matrix-data-row--has-note' : ''
                              }`}
                            >
                              {/* Feature Name & Note Action */}
                              <td className="rfq-td rfq-td--feature">
                                <div className="rfq-feature-cell">
                                  <span className="rfq-feature-name">{row.feature}</span>
                                  <div className="rfq-feature-note-btn-wrap">
                                    <button
                                      type="button"
                                      className={`rfq-note-action-btn ${
                                        hasNote ? 'rfq-note-action-btn--active' : ''
                                      }`}
                                      onClick={() =>
                                        handleStartEditNote(row.id, buyerNotes[row.id] || '')
                                      }
                                      title={hasNote ? 'Edit buyer note' : 'Add buyer note for this specification'}
                                    >
                                      <MessageSquarePlus size={13} />
                                      <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Buyer Requirement (Reference Column) */}
                              <td className="rfq-td rfq-td--buyer-req">
                                <div className="rfq-buyer-req-content">
                                  {row.detailRequirement}
                                </div>
                              </td>

                              {/* Vendor Columns */}
                              {availableVendors.map((vendorName) => {
                                const responseValue =
                                  row.responses[vendorName] ||
                                  'Compliant with specification standard';
                                const isSelected =
                                  selectedVendorForApproval === vendorName;

                                return (
                                  <td
                                    key={vendorName}
                                    className={`rfq-td rfq-td--vendor-response ${
                                      isSelected
                                        ? 'rfq-td--vendor-response-selected'
                                        : ''
                                    }`}
                                  >
                                    <div className="rfq-vendor-response-text">
                                      {responseValue}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Inline Buyer Note Banner / Editor Row */}
                            {(hasNote || isEditingNote) && (
                              <tr className="rfq-matrix-note-row">
                                <td colSpan={2 + availableVendors.length}>
                                  <div className="rfq-matrix-note-container">
                                    {isEditingNote ? (
                                      <div className="rfq-matrix-note-editor">
                                        <div className="rfq-note-editor-header">
                                          <span className="rfq-note-editor-title">
                                            <Edit3 size={13} /> Buyer Remark for "{row.feature}"
                                          </span>
                                        </div>
                                        <textarea
                                          value={tempNoteText}
                                          onChange={(e) => setTempNoteText(e.target.value)}
                                          placeholder="Enter buyer observation, specification deviation, or evaluation remark..."
                                          className="rfq-note-textarea"
                                          rows={2}
                                          autoFocus
                                        />
                                        <div className="rfq-note-editor-actions">
                                          <button
                                            type="button"
                                            className="rfq-btn rfq-btn--xs rfq-btn--primary"
                                            onClick={() => handleSaveNote(row.id)}
                                          >
                                            <Check size={12} /> Save Note
                                          </button>
                                          <button
                                            type="button"
                                            className="rfq-btn rfq-btn--xs rfq-btn--secondary"
                                            onClick={() => setEditingNoteRowId(null)}
                                          >
                                            Cancel
                                          </button>
                                          {hasNote && (
                                            <button
                                              type="button"
                                              className="rfq-btn rfq-btn--xs rfq-btn--danger"
                                              onClick={() => handleDeleteNote(row.id)}
                                            >
                                              <Trash2 size={12} /> Delete
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="rfq-matrix-note-display">
                                        <div className="rfq-note-display-left">
                                          <span className="rfq-note-pill-tag">
                                            Buyer Note: {row.feature}
                                          </span>
                                          <span className="rfq-note-text">
                                            "{buyerNotes[row.id]}"
                                          </span>
                                        </div>
                                        <div className="rfq-note-display-actions">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleStartEditNote(row.id, buyerNotes[row.id])
                                            }
                                            className="rfq-btn-icon-subtle"
                                            title="Edit note"
                                          >
                                            <Edit3 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteNote(row.id)}
                                            className="rfq-btn-icon-subtle rfq-btn-icon-subtle--danger"
                                            title="Delete note"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Commercial Comparison Section */}
      <div className="rfq-comparative-commercial-card">
        <div className="rfq-commercial-header">
          <div>
            <h3 className="rfq-comp-section-title">
              <DollarSign size={17} className="rfq-icon-indigo" />
              <span>Commercial Terms &amp; Quotation Value Comparison</span>
            </h3>
            <p className="rfq-comp-section-sub">
              Comparison of unit pricing, quantity, statutory GST breakdown, lead times, payment terms, and warranty.
            </p>
          </div>
          <span className="rfq-pill-subtle">Requested Quantity: 20 Units</span>
        </div>

        <div className="rfq-commercial-table-wrap">
          <table className="rfq-commercial-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Commercial Parameter</th>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  const isSelected = selectedVendorForApproval === vendorName;

                  return (
                    <th
                      key={vendorName}
                      className={isSelected ? 'rfq-th-comm-selected' : ''}
                      style={{ width: '26%' }}
                    >
                      <div className="rfq-comm-th-vendor">
                        <span className="rfq-comm-vendor-name">{vendorName}</span>
                        <span className="rfq-comm-qtn-num">
                          {quote?.quotationNumber || 'QTN-2026'}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Unit Price (Excl. Tax)</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      ₹{quote?.unitPrice.toLocaleString('en-IN') || '—'} / unit
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">Quantity</td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      {quote?.quantity || 20} Nos
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Subtotal Value</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      ₹{quote?.subtotal.toLocaleString('en-IN') || '—'}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">GST Rate</td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      {((quote?.taxRate || 0.18) * 100).toFixed(0)}% (IGST / CGST+SGST)
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">GST Tax Amount</td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      ₹{quote?.taxAmount.toLocaleString('en-IN') || '—'}
                    </td>
                  );
                })}
              </tr>

              <tr className="rfq-comm-total-row">
                <td className="rfq-comm-param-label">
                  <strong>Total Quotation Value (Inc. Tax)</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  const isLowest = quote?.totalAmount === 1604800;

                  return (
                    <td
                      key={vendorName}
                      className={`rfq-comm-value rfq-comm-value--total ${
                        isLowest ? 'rfq-comm-value--lowest' : ''
                      }`}
                    >
                      <div className="rfq-comm-total-inner">
                        <span className="rfq-comm-total-price">
                          ₹{quote?.totalAmount.toLocaleString('en-IN') || '—'}
                        </span>
                        {isLowest && (
                          <span className="rfq-lowest-badge">Lowest Price</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Delivery / Lead Time</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      <div className="rfq-comm-flex-cell">
                        <Truck size={14} className="rfq-icon-indigo" />
                        <span>{quote?.deliveryTimeline || '5-7 Business Days'}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Payment Terms</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      {quote?.paymentTerms || 'Net 30 Days'}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Warranty Coverage</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value">
                      <div className="rfq-comm-flex-cell">
                        <Shield size={14} className="rfq-icon-indigo" />
                        <span>{quote?.warranty || '3 Years Comprehensive'}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="rfq-comm-param-label">
                  <strong>Vendor Remarks &amp; Notes</strong>
                </td>
                {availableVendors.map((vendorName) => {
                  const quote = mockLaptopCommercialQuotations[vendorName];
                  return (
                    <td key={vendorName} className="rfq-comm-value rfq-comm-remarks-cell">
                      <p className="rfq-comm-remarks-text">
                        {quote?.vendorRemarks || 'Standard enterprise delivery.'}
                      </p>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Overall Remarks & Selection Bar */}
      <div className="rfq-comparative-remarks-card">
        <div className="rfq-remarks-header">
          <div className="rfq-remarks-title-wrap">
            <h4 className="rfq-remarks-title">Overall Remarks &amp; Selection Reasoning</h4>
            <span className="rfq-remarks-subtitle">
              Document your procurement justification for supplier awarding and compliance audit trail.
            </span>
          </div>
        </div>

        <textarea
          value={overallRemarks}
          onChange={(e) => setOverallRemarks(e.target.value)}
          placeholder="Enter overall procurement reasoning, vendor comparison summary, and commercial justifications..."
          className="rfq-overall-remarks-textarea"
          rows={3}
        />
      </div>

      {/* 6. Vendor Selection & Approve Action Bar */}
      <div className="rfq-comparative-approval-bar">
        <div className="rfq-approval-bar-left">
          <div className="rfq-select-vendor-wrap">
            <label htmlFor="vendor-select-dropdown" className="rfq-select-label">
              Select Vendor for Awarding:
            </label>
            <div className="rfq-select-dropdown-container">
              <select
                id="vendor-select-dropdown"
                value={selectedVendorForApproval}
                onChange={(e) => setSelectedVendorForApproval(e.target.value)}
                className="rfq-vendor-select-dropdown"
              >
                {availableVendors.map((vName) => {
                  const q = mockLaptopCommercialQuotations[vName];
                  return (
                    <option key={vName} value={vName}>
                      {vName} — ₹{q?.totalAmount.toLocaleString('en-IN')} (
                      {q?.deliveryTimeline})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="rfq-selected-vendor-quick-summary">
            <span className="rfq-quick-pill">
              <strong>Total Value:</strong> ₹{selectedCommercialQuote?.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="rfq-quick-pill">
              <strong>Lead Time:</strong> {selectedCommercialQuote?.deliveryTimeline}
            </span>
            <span className="rfq-quick-pill">
              <strong>Warranty:</strong> {selectedCommercialQuote?.warranty}
            </span>
          </div>
        </div>

        <div className="rfq-approval-bar-right">
          <button
            type="button"
            className="rfq-btn rfq-btn--lg rfq-btn--primary rfq-btn--approve-vendor"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <ShieldCheck size={18} />
            <span>Approve Vendor</span>
          </button>
        </div>
      </div>

      {/* 7. Comprehensive Approval Confirmation / Review Modal */}
      {isReviewModalOpen && (
        <div
          className="rfq-modal-backdrop"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="rfq-modal-card rfq-modal-card--comparative-review"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="rfq-modal-header">
              <div className="rfq-modal-header-icon rfq-modal-header-icon--green">
                <ShieldCheck size={22} />
              </div>
              <div className="rfq-modal-header-text">
                <h3 className="rfq-modal-title">Review &amp; Confirm Vendor Award</h3>
                <p className="rfq-modal-sub">
                  Commercial Proposal &amp; Technical Alignment Review for {rfq.rfqNumber || 'RFQ-2026-0088'}
                </p>
              </div>
              <button
                className="rfq-modal-close-btn"
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="rfq-modal-body rfq-modal-body--scrollable">
              {/* Selected Vendor Banner */}
              <div className="rfq-review-vendor-banner">
                <div className="rfq-review-vendor-avatar" style={{ backgroundColor: selectedCommercialQuote.logoColor }}>
                  {selectedCommercialQuote.logoInitial}
                </div>
                <div className="rfq-review-vendor-details">
                  <div className="rfq-review-vendor-badge">Selected Award Candidate</div>
                  <h4 className="rfq-review-vendor-name">{selectedCommercialQuote.vendorName}</h4>
                  <div className="rfq-review-vendor-meta">
                    <span>Quotation: <code>{selectedCommercialQuote.quotationNumber}</code></span>
                    <span>Location: {selectedCommercialQuote.location}</span>
                    <span>Rating: ★ {selectedCommercialQuote.rating}</span>
                  </div>
                </div>
                <div className="rfq-review-price-box">
                  <span className="rfq-review-price-label">Total Commercial Value</span>
                  <span className="rfq-review-price-val">
                    ₹{selectedCommercialQuote.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="rfq-review-price-sub">Including 18% GST</span>
                </div>
              </div>

              {/* Commercial Breakdown Grid */}
              <div className="rfq-review-section">
                <h5 className="rfq-review-section-title">
                  <DollarSign size={15} /> Commercial Proposal Breakdown
                </h5>
                <div className="rfq-review-commercial-grid">
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">Unit Price</span>
                    <strong className="rfq-rev-value">₹{selectedCommercialQuote.unitPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">Quantity</span>
                    <strong className="rfq-rev-value">{selectedCommercialQuote.quantity} Units</strong>
                  </div>
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">Subtotal (Excl. Tax)</span>
                    <strong className="rfq-rev-value">₹{selectedCommercialQuote.subtotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">GST Tax (18%)</span>
                    <strong className="rfq-rev-value">₹{selectedCommercialQuote.taxAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">Delivery Timeline</span>
                    <strong className="rfq-rev-value">{selectedCommercialQuote.deliveryTimeline}</strong>
                  </div>
                  <div className="rfq-review-grid-item">
                    <span className="rfq-rev-label">Payment Terms</span>
                    <strong className="rfq-rev-value">{selectedCommercialQuote.paymentTerms}</strong>
                  </div>
                </div>
              </div>

              {/* Warranty & Value Proposition */}
              <div className="rfq-review-section">
                <h5 className="rfq-review-section-title">
                  <Shield size={15} /> Warranty &amp; Service Terms
                </h5>
                <div className="rfq-review-warranty-box">
                  <strong>{selectedCommercialQuote.warranty}</strong>
                  <p>{selectedCommercialQuote.vendorRemarks}</p>
                </div>
              </div>

              {/* Key Quoted Specifications */}
              <div className="rfq-review-section">
                <h5 className="rfq-review-section-title">
                  <Layers size={15} /> Key Quoted Specifications
                </h5>
                <div className="rfq-review-specs-grid">
                  <div className="rfq-rev-spec-pill">
                    <strong>Processor:</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Performance')?.rows.find((r) => r.feature === 'Processor / CPU')?.responses[selectedVendorForApproval] || 'Intel Core i7 (13th Gen)'}
                    </span>
                  </div>
                  <div className="rfq-rev-spec-pill">
                    <strong>Memory (RAM):</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Memory & Storage')?.rows.find((r) => r.feature === 'RAM (System Memory)')?.responses[selectedVendorForApproval] || '16 GB'} (
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Memory & Storage')?.rows.find((r) => r.feature === 'RAM Type')?.responses[selectedVendorForApproval]})
                    </span>
                  </div>
                  <div className="rfq-rev-spec-pill">
                    <strong>Storage:</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Memory & Storage')?.rows.find((r) => r.feature === 'Storage Capacity')?.responses[selectedVendorForApproval] || '512 GB'} (
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Memory & Storage')?.rows.find((r) => r.feature === 'Storage Type')?.responses[selectedVendorForApproval]})
                    </span>
                  </div>
                  <div className="rfq-rev-spec-pill">
                    <strong>Display:</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Display')?.rows.find((r) => r.feature === 'Screen Size')?.responses[selectedVendorForApproval]} (
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Display')?.rows.find((r) => r.feature === 'Resolution')?.responses[selectedVendorForApproval]})
                    </span>
                  </div>
                  <div className="rfq-rev-spec-pill">
                    <strong>Dedicated GPU:</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Graphics')?.rows.find((r) => r.feature === 'Graphics Processor')?.responses[selectedVendorForApproval] || 'NVIDIA GeForce RTX 4060'}
                    </span>
                  </div>
                  <div className="rfq-rev-spec-pill">
                    <strong>Operating System:</strong>
                    <span>
                      {mockLaptopSpecificationGroups.find((g) => g.name === 'Performance')?.rows.find((r) => r.feature === 'Operating System')?.responses[selectedVendorForApproval] || 'Windows 11'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buyer Specification Notes */}
              {Object.keys(buyerNotes).length > 0 && (
                <div className="rfq-review-section">
                  <h5 className="rfq-review-section-title">
                    <MessageSquarePlus size={15} /> Buyer Specification Notes ({Object.keys(buyerNotes).length})
                  </h5>
                  <div className="rfq-review-notes-list">
                    {Object.entries(buyerNotes).map(([rowId, noteText]) => {
                      // Find row feature name
                      let featureName = rowId;
                      for (const grp of mockLaptopSpecificationGroups) {
                        const matchRow = grp.rows.find((r) => r.id === rowId);
                        if (matchRow) {
                          featureName = matchRow.feature;
                          break;
                        }
                      }
                      return (
                        <div key={rowId} className="rfq-review-note-item">
                          <span className="rfq-review-note-feature">{featureName}:</span>
                          <span className="rfq-review-note-val">"{noteText}"</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overall Remarks */}
              {overallRemarks && (
                <div className="rfq-review-section">
                  <h5 className="rfq-review-section-title">
                    <Info size={15} /> Buyer Overall Justification
                  </h5>
                  <div className="rfq-review-justification-box">
                    <p>{overallRemarks}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="rfq-modal-footer">
              <button
                type="button"
                className="rfq-btn rfq-btn--secondary"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Back to Comparison
              </button>
              <button
                type="button"
                className="rfq-btn rfq-btn--primary rfq-btn--approve-btn"
                onClick={handleConfirmApproval}
              >
                <CheckCircle2 size={16} />
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQComparativeView;
