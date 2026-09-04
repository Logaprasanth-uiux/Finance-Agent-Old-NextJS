"use client";
import React, { useState, useMemo } from 'react';
import type { Vendor } from '../../types/rfq';
import { API_ENDPOINTS } from '../../config/api';
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
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.vendors)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.Vendors || data.items || []);
        const mappedVendors: Vendor[] = arr.map((apiItem: any) => ({
          id: apiItem.memberid || `v-${Math.random()}`,
          name: apiItem.organizationname || apiItem.memberid || 'Unknown Vendor',
          code: apiItem.memberid || 'N/A',
          category: apiItem.membergroup || 'Uncategorized',
          location: '',
          rating: 0,
          relationshipStatus: apiItem.transactionstatus === 'Active' ? 'Verified Vendor' : 'Contracted',
          email: apiItem.emailid || apiItem.useremailid || '',
          phone: '',
          leadTime: '',
          paymentTerms: apiItem.paymentterms || 'Standard',
          logoInitial: (apiItem.organizationname || apiItem.memberid || 'V').slice(0, 2).toUpperCase(),
          logoColor: '#4F46E5'
        }));
        setVendorList(mappedVendors);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch vendors:', err);
        setIsLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendorList.forEach((v) => set.add(v.category));
    return ['ALL', ...Array.from(set)];
  }, [vendorList]);

  const filteredVendors = useMemo(() => {
    return vendorList.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || v.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory, vendorList]);

  const isVendorSelected = (vendorId: string) => {
    return selectedVendors.some((v) => v.id === vendorId);
  };



  return (
    <div className="rfq-step-layout">
      {/* Clean Step Heading */}
      <div className="rfq-step-heading-row">
        <h2 className="rfq-step-main-title">Step 3: Supplier &amp; Vendor Selection</h2>
      </div>
      {/* Selected Vendors Bar */}
      <div className="rfq-vendors-summary-bar">
        <div className="rfq-vendors-summary-bar__left">
          <span className="rfq-vendors-summary-bar__count">
            <strong>{selectedVendors.length}</strong> of {vendorList.length} Suppliers Selected
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
          {selectedVendors.length < vendorList.length && vendorList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                // To safely implement 'Select All', we trigger toggles for missing ones
                // Normally this would require passing the new array up. For now, it might be disabled
                // if we don't have a direct setter.
              }}
              className="rfq-btn rfq-btn--xs rfq-btn--outline"
              disabled
              title="Select All is temporarily disabled when loading live data"
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
        {isLoading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Loading vendors from database...
          </div>
        )}
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


                  <h3 className="rfq-vendor-card__name">{vendor.name}</h3>
                  <span className="rfq-vendor-card__code">Code: {vendor.code}</span>
                </div>
              </div>

              {/* Category */}
              <div className="rfq-vendor-card__meta-group">
                <div className="rfq-vendor-card__meta-item">
                  <Building2 size={13} className="rfq-meta-icon" />
                  <span>{vendor.category}</span>
                </div>
              </div>


            </div>
          );
        })}

        {!isLoading && filteredVendors.length === 0 && (
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

