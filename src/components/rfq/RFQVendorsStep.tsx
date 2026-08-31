"use client";
import React, { useState, useMemo } from 'react';
import type { Vendor } from '../../types/rfq';
import { mockVendors } from '../../data/rfqMockData';
import {
  Building2,
  Search,
  Check,
  Star,
  MapPin,
  Clock,
  CreditCard,
  UserPlus,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

interface RFQVendorsStepProps {
  selectedVendors: Vendor[];
  onToggleVendor: (vendor: Vendor) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onOpenAddNewVendorModal: () => void;
}

export const RFQVendorsStep: React.FC<RFQVendorsStepProps> = ({
  selectedVendors,
  onToggleVendor,
  onSelectAll,
  onClearAll,
  onOpenAddNewVendorModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    mockVendors.forEach((v) => set.add(v.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredVendors = useMemo(() => {
    return mockVendors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || v.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const isVendorSelected = (vendorId: string) => {
    return selectedVendors.some((v) => v.id === vendorId);
  };

  const getRelationshipBadgeClass = (status: Vendor['relationshipStatus']) => {
    switch (status) {
      case 'Preferred Partner':
        return 'rfq-badge-preferred';
      case 'Approved Supplier':
        return 'rfq-badge-approved';
      case 'Verified Vendor':
        return 'rfq-badge-verified';
      default:
        return 'rfq-badge-contracted';
    }
  };

  return (
    <div className="rfq-step-layout">
      {/* Selected Vendors Bar */}
      <div className="rfq-vendors-summary-bar">
        <div className="rfq-vendors-summary-bar__left">
          <span className="rfq-vendors-summary-bar__count">
            <strong>{selectedVendors.length}</strong> of {mockVendors.length} Suppliers Selected
          </span>
          <div className="rfq-vendor-chips">
            {selectedVendors.map((v) => (
              <span key={v.id} className="rfq-vendor-chip">
                <span>{v.name}</span>
                <button
                  type="button"
                  onClick={() => onToggleVendor(v)}
                  className="rfq-vendor-chip__remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="rfq-vendors-summary-bar__actions">
          {selectedVendors.length < mockVendors.length && (
            <button
              type="button"
              onClick={onSelectAll}
              className="rfq-btn rfq-btn--xs rfq-btn--outline"
            >
              Select All Verified
            </button>
          )}
          {selectedVendors.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rfq-btn rfq-btn--xs rfq-btn--ghost"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Row with Compact "+ Add New Vendor" Action */}
      <div className="rfq-catalog-pane__header rfq-vendors-filter-header">
        <div className="rfq-catalog-search-row">
          <div className="rfq-catalog-pane__search">
            <Search size={15} className="rfq-search-icon" />
            <input
              type="text"
              placeholder="Search vendor by corporate name, code, category, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rfq-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="rfq-search-clear"
              >
                ×
              </button>
            )}
          </div>

          {/* Compact Add New Vendor Button */}
          <button
            type="button"
            onClick={onOpenAddNewVendorModal}
            className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--compact-add"
            title="Onboard a new supplier through Vendor Master"
          >
            <UserPlus size={14} className="rfq-icon-indigo" />
            <span>+ Add New Vendor</span>
          </button>
        </div>

        <div className="rfq-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rfq-category-pill ${
                selectedCategory === cat ? 'rfq-category-pill--active' : ''
              }`}
            >
              {cat === 'ALL' ? 'All Supplier Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="rfq-vendors-grid">
        {filteredVendors.map((vendor) => {
          const selected = isVendorSelected(vendor.id);

          return (
            <div
              key={vendor.id}
              onClick={() => onToggleVendor(vendor)}
              className={`rfq-vendor-card ${
                selected ? 'rfq-vendor-card--selected' : ''
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onToggleVendor(vendor);
                }
              }}
            >
              {/* Checkbox / Selection Indicator */}
              <div className="rfq-vendor-card__select-indicator">
                <div
                  className={`rfq-custom-checkbox ${
                    selected ? 'rfq-custom-checkbox--checked' : ''
                  }`}
                >
                  {selected && <Check size={13} />}
                </div>
              </div>

              {/* Vendor Header */}
              <div className="rfq-vendor-card__header">
                <div
                  className="rfq-vendor-card__avatar"
                  style={{ backgroundColor: vendor.logoColor || '#4F46E5' }}
                >
                  {vendor.logoInitial || vendor.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="rfq-vendor-card__title-block">
                  <div className="rfq-vendor-card__badge-row">
                    <span
                      className={`rfq-vendor-badge ${getRelationshipBadgeClass(
                        vendor.relationshipStatus
                      )}`}
                    >
                      <ShieldCheck size={11} />
                      {vendor.relationshipStatus}
                    </span>
                    <span className="rfq-vendor-card__rating">
                      <Star size={11} className="rfq-star-filled" />
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="rfq-vendor-card__name">{vendor.name}</h3>
                  <span className="rfq-vendor-card__code">Code: {vendor.code}</span>
                </div>
              </div>

              {/* Category & Location */}
              <div className="rfq-vendor-card__meta-group">
                <div className="rfq-vendor-card__meta-item">
                  <Building2 size={13} className="rfq-meta-icon" />
                  <span>{vendor.category}</span>
                </div>

                <div className="rfq-vendor-card__meta-item">
                  <MapPin size={13} className="rfq-meta-icon" />
                  <span>{vendor.location}</span>
                </div>
              </div>

              {/* Terms & Delivery */}
              <div className="rfq-vendor-card__footer-terms">
                <div className="rfq-vendor-term">
                  <Clock size={12} />
                  <span>Lead Time: <strong>{vendor.leadTime}</strong></span>
                </div>
                <div className="rfq-vendor-term">
                  <CreditCard size={12} />
                  <span>Terms: <strong>{vendor.paymentTerms}</strong></span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="rfq-empty-catalog" style={{ gridColumn: '1 / -1' }}>
            <SlidersHorizontal size={24} />
            <p>No verified vendors match your filter criteria.</p>
            <button
              type="button"
              className="rfq-btn rfq-btn--sm rfq-btn--outline"
              onClick={onOpenAddNewVendorModal}
            >
              + Onboard new vendor through Vendor Master
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQVendorsStep;

