"use client";
import React, { useState, useMemo } from 'react';
import type { CatalogItem, RFQItemSelection } from '../../types/rfq';
import { mockCatalogItems } from '../../data/rfqMockData';
import {
  Package,
  Plus,
  Trash2,
  Search,
  Check,
  Cpu,
  Layers,
  SlidersHorizontal,
  PackagePlus,
  Building2,
  Lock,
} from 'lucide-react';

interface RFQItemsStepProps {
  selectedItems: RFQItemSelection[];
  selectedCompany?: string;
  onAddItem: (item: CatalogItem, quantity?: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onOpenAddNewItemModal: () => void;
}

export const RFQItemsStep: React.FC<RFQItemsStepProps> = ({
  selectedItems,
  selectedCompany = 'Acme Technologies Pvt Ltd',
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onOpenAddNewItemModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    mockCatalogItems.forEach((item) => set.add(item.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredCatalog = useMemo(() => {
    return mockCatalogItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((sel) => sel.item.id === itemId);
  };

  return (
    <div className="rfq-step-layout">
      {/* Clean Step Heading */}
      <div className="rfq-step-heading-row">
        <h2 className="rfq-step-main-title">Step 1: Select Items &amp; Quantities</h2>
      </div>

      {/* Active Company Context Banner - Compact & Clean */}
      <div className="rfq-step-company-banner">
        <div className="rfq-step-company-banner__icon">
          <Building2 size={16} />
        </div>
        <div className="rfq-step-company-banner__content">
          <span className="rfq-step-company-banner__label">Company / Legal Entity Context</span>
          <h4 className="rfq-step-company-banner__name">{selectedCompany}</h4>
        </div>
        <div className="rfq-step-company-banner__status">
          <Lock size={12} />
          <span>Context Fixed for RFQ</span>
        </div>
      </div>

      <div className="rfq-items-grid-container">
        {/* Left Column: Available Catalog Items */}
        <div className="rfq-catalog-pane">
          {/* Compact Integrated Search & Filter Header with inline "+ Add New Item" */}
          <div className="rfq-catalog-pane__header">
            <div className="rfq-catalog-search-row">
              <div className="rfq-catalog-pane__search">
                <Search size={15} className="rfq-search-icon" />
                <input
                  type="text"
                  placeholder="Search catalog items, models, or categories..."
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

              {/* Compact Add New Item Button in Search Row */}
              <button
                type="button"
                onClick={onOpenAddNewItemModal}
                className="rfq-btn rfq-btn--sm rfq-btn--outline rfq-btn--compact-add"
                title="Add a non-catalog item through Item Master"
              >
                <PackagePlus size={14} className="rfq-icon-indigo" />
                <span>+ Add New Item</span>
              </button>
            </div>

            {/* Category Pills */}
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
                  {cat === 'ALL' ? 'All Products' : cat.split('/')[1] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Items List */}
          <div className="rfq-catalog-list">
            {filteredCatalog.map((item) => {
              const selected = isItemSelected(item.id);
              const currentSel = selectedItems.find((s) => s.item.id === item.id);

              return (
                <div
                  key={item.id}
                  className={`rfq-catalog-card ${
                    selected ? 'rfq-catalog-card--selected' : ''
                  }`}
                >
                  <div className="rfq-catalog-card__main">
                    <div className="rfq-catalog-card__icon-wrap">
                      <Package size={20} />
                    </div>

                    <div className="rfq-catalog-card__details">
                      <div className="rfq-catalog-card__meta-top">
                        <span className="rfq-catalog-card__model">
                          Model: {item.model}
                        </span>
                        <span className="rfq-catalog-card__category">
                          {item.category}
                        </span>
                        {item.badge && (
                          <span className="rfq-catalog-card__badge">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="rfq-catalog-card__name">{item.name}</h4>

                      <div className="rfq-catalog-card__specs-hint">
                        <Cpu size={13} className="rfq-icon-indigo" />
                        <span>
                          <strong>{item.baseSpecs.length} baseline specs</strong> available in Item Master
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rfq-catalog-card__actions">
                    {selected ? (
                      <div className="rfq-catalog-card__added-status">
                        <span className="rfq-pill-added">
                          <Check size={13} />
                          Added ({currentSel?.quantity} {item.unit})
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddItem(item, item.defaultQuantity)}
                        className="rfq-btn rfq-btn--sm rfq-btn--primary"
                      >
                        <Plus size={14} />
                        <span>Add to RFQ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredCatalog.length === 0 && (
              <div className="rfq-empty-catalog">
                <SlidersHorizontal size={24} />
                <p>No catalog items match your search criteria.</p>
                <button
                  type="button"
                  className="rfq-btn rfq-btn--sm rfq-btn--outline"
                  onClick={onOpenAddNewItemModal}
                >
                  + Add new item through Item Master
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Items Summary & Quantities */}
        <div className="rfq-selected-pane">
          <div className="rfq-selected-pane__header">
            <div className="rfq-selected-pane__title-wrap">
              <h3 className="rfq-selected-pane__title">Selected RFQ Items</h3>
              <span className="rfq-selected-count-badge">
                {selectedItems.length} {selectedItems.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>
            <p className="rfq-selected-pane__sub">
              Adjust requested quantities before proceeding to specification review
            </p>
          </div>

          {selectedItems.length === 0 ? (
            <div className="rfq-selected-empty">
              <div className="rfq-selected-empty__icon">
                <Package size={28} />
              </div>
              <h4>No items selected yet</h4>
              <p>
                Click <strong>"+ Add to RFQ"</strong> from the Item Master catalog on the left to include products in this quotation request.
              </p>
            </div>
          ) : (
            <div className="rfq-selected-list">
              {selectedItems.map((sel, idx) => (
                <div key={sel.item.id} className="rfq-selected-card">
                  <div className="rfq-selected-card__top">
                    <div className="rfq-selected-card__num">{idx + 1}</div>
                    <div className="rfq-selected-card__info">
                      <div className="rfq-selected-card__model-row">
                        <span className="rfq-selected-card__model">
                          {sel.item.model}
                        </span>
                        <span className="rfq-selected-card__cat">
                          {sel.item.category}
                        </span>
                      </div>
                      <h4 className="rfq-selected-card__title">
                        {sel.item.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(sel.item.id)}
                      className="rfq-selected-card__delete-btn"
                      title="Remove item from RFQ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="rfq-selected-card__bottom">
                    <div className="rfq-selected-card__specs-count">
                      <Layers size={13} />
                      <span>{sel.item.baseSpecs.length} Baseline Specs</span>
                    </div>

                    <div className="rfq-qty-control">
                      <label className="rfq-qty-label">Quantity:</label>
                      <div className="rfq-qty-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(sel.item.id, Math.max(1, sel.quantity - 1))
                          }
                          className="rfq-qty-btn"
                          disabled={sel.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={sel.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                              onUpdateQuantity(sel.item.id, val);
                            }
                          }}
                          className="rfq-qty-input"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(sel.item.id, sel.quantity + 1)
                          }
                          className="rfq-qty-btn"
                        >
                          +
                        </button>
                        <span className="rfq-qty-unit">{sel.item.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Summary */}
          <div className="rfq-selected-pane__footer">
            <div className="rfq-selected-pane__summary-info">
              <span>Total Selected Items:</span>
              <strong>
                {selectedItems.reduce((acc, curr) => acc + curr.quantity, 0)} Units Across {selectedItems.length} Products
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQItemsStep;

