"use client";
import React, { useState } from 'react';
import type { RFQItemSelection, ItemSpecification } from '../../types/rfq';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface RFQSpecificationStepProps {
  selectedItems: RFQItemSelection[];
  onUpdateSpecifications: (itemId: string, specs: ItemSpecification[]) => void;
}

export const RFQSpecificationStep: React.FC<RFQSpecificationStepProps> = ({
  selectedItems,
  onUpdateSpecifications,
}) => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string>('');
  const [editVal, setEditVal] = useState<string>('');

  // Add custom specification state
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customKey, setCustomKey] = useState<string>('');
  const [customVal, setCustomVal] = useState<string>('');

  const currentSelection = selectedItems[activeItemIndex] || selectedItems[0];
  if (!currentSelection) {
    return null;
  }

  const handleEnrichWithAI = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Merge AI suggestions that aren't already present
      const existingKeys = new Set(
        currentSelection.specifications.map((s) => s.key.toLowerCase())
      );
      const newSuggestions = currentSelection.item.aiSuggestions.filter(
        (s) => !existingKeys.has(s.key.toLowerCase())
      );

      const merged = [...currentSelection.specifications, ...newSuggestions];
      onUpdateSpecifications(currentSelection.item.id, merged);
      setIsAnalyzing(false);
    }, 900);
  };

  const handleAcceptAllAI = () => {
    const updated = currentSelection.specifications.map((s) => ({
      ...s,
      isAccepted: true,
    }));
    onUpdateSpecifications(currentSelection.item.id, updated);
  };

  const handleRemoveSpec = (specId: string) => {
    const filtered = currentSelection.specifications.filter((s) => s.id !== specId);
    onUpdateSpecifications(currentSelection.item.id, filtered);
  };

  const handleStartEdit = (spec: ItemSpecification) => {
    setEditingSpecId(spec.id);
    setEditKey(spec.key);
    setEditVal(spec.value);
  };

  const handleSaveEdit = () => {
    if (!editingSpecId) return;
    const updated = currentSelection.specifications.map((s) => {
      if (s.id === editingSpecId) {
        return { ...s, key: editKey, value: editVal, isAccepted: true };
      }
      return s;
    });
    onUpdateSpecifications(currentSelection.item.id, updated);
    setEditingSpecId(null);
  };

  const handleAddCustomSpec = () => {
    if (!customKey.trim() || !customVal.trim()) return;

    const newSpec: ItemSpecification = {
      id: `custom-${Date.now()}`,
      key: customKey.trim(),
      value: customVal.trim(),
      source: 'custom',
      isAccepted: true,
      category: 'Custom Requirement',
    };

    onUpdateSpecifications(currentSelection.item.id, [
      ...currentSelection.specifications,
      newSpec,
    ]);
    setCustomKey('');
    setCustomVal('');
    setIsAddingCustom(false);
  };

  const itemMasterSpecs = currentSelection.specifications.filter(
    (s) => s.source === 'item-master'
  );
  const aiSuggestedSpecs = currentSelection.specifications.filter(
    (s) => s.source === 'ai-suggested'
  );
  const customSpecs = currentSelection.specifications.filter(
    (s) => s.source === 'custom'
  );

  const hasAIAdded = aiSuggestedSpecs.length > 0;

  return (
    <div className="rfq-step-layout">
      {/* Clean Step Heading */}
      <div className="rfq-step-heading-row">
        <h2 className="rfq-step-main-title">Step 2: Technical Specifications &amp; AI Enrichment</h2>
      </div>

      {/* Multi-Item Context Switcher Tabs */}
      {selectedItems.length > 1 && (
        <div className="rfq-item-tabs">
          {selectedItems.map((sel, idx) => {
            const isActive = idx === activeItemIndex;
            const hasAi = sel.specifications.some((s) => s.source === 'ai-suggested');

            return (
              <button
                key={sel.item.id}
                type="button"
                onClick={() => {
                  setActiveItemIndex(idx);
                  setIsAddingCustom(false);
                  setEditingSpecId(null);
                }}
                className={`rfq-item-tab ${isActive ? 'rfq-item-tab--active' : ''}`}
              >
                <div className="rfq-item-tab__title-row">
                  <span className="rfq-item-tab__name">{sel.item.name}</span>
                  <span className="rfq-item-tab__qty">
                    {sel.quantity} {sel.item.unit}
                  </span>
                </div>
                <div className="rfq-item-tab__sub">
                  <span>{sel.specifications.length} Specs</span>
                  {hasAi && <span className="rfq-pill-ai-mini">✨ AI Enriched</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Spec Workspace */}
      <div className="rfq-spec-workspace">
        {/* Active Item Context Header Banner */}
        <div className="rfq-spec-header-card">
          <div className="rfq-spec-header-card__info">
            <div className="rfq-spec-header-card__tag-row">
              <span className="rfq-spec-header-card__model">
                Model: {currentSelection.item.model}
              </span>
              <span className="rfq-spec-header-card__category">
                {currentSelection.item.category}
              </span>
              <span className="rfq-spec-header-card__qty-badge">
                Requested Quantity: {currentSelection.quantity} {currentSelection.item.unit}
              </span>
            </div>
            <h3 className="rfq-spec-header-card__name">
              {currentSelection.item.name}
            </h3>
          </div>

          <div className="rfq-spec-header-card__actions">
            <button
              type="button"
              onClick={handleEnrichWithAI}
              disabled={isAnalyzing || hasAIAdded}
              className={`rfq-btn rfq-btn--ai ${hasAIAdded ? 'rfq-btn--ai-done' : ''}`}
              title="Identify missing procurement and technical criteria with AI"
            >
              <Sparkles size={16} className={isAnalyzing ? 'rfq-spin' : ''} />
              <span>
                {isAnalyzing
                  ? 'Analyzing Item Master Specs...'
                  : hasAIAdded
                  ? 'AI Specifications Applied'
                  : 'Complete Specification with AI'}
              </span>
            </button>
          </div>
        </div>

        {/* AI Insight Bar when enriched */}
        {hasAIAdded && (
          <div className="rfq-ai-callout">
            <div className="rfq-ai-callout__icon">
              <Sparkles size={18} />
            </div>
            <div className="rfq-ai-callout__content">
              <div className="rfq-ai-callout__title">
                AI Spec Analysis Complete: {aiSuggestedSpecs.length} Procurement Additions Suggested
              </div>
              <div className="rfq-ai-callout__desc">
                Identified key enterprise criteria missing from base Item Master (Warranty, Port Standards, Battery, and Support SLA). You can accept, edit, or remove each item before finalizing.
              </div>
            </div>
            <button
              type="button"
              onClick={handleAcceptAllAI}
              className="rfq-btn rfq-btn--sm rfq-btn--ai-outline"
            >
              <CheckCircle2 size={13} />
              <span>Accept All Suggestions</span>
            </button>
          </div>
        )}

        {/* Specifications Table & Grid */}
        <div className="rfq-specs-container">
          <div className="rfq-specs-table-header">
            <div className="rfq-specs-col rfq-specs-col--key">Specification Key</div>
            <div className="rfq-specs-col rfq-specs-col--source">Source / Origin</div>
            <div className="rfq-specs-col rfq-specs-col--val">Requested Value & Details</div>
            <div className="rfq-specs-col rfq-specs-col--actions">Actions</div>
          </div>

          <div className="rfq-specs-list">
            {/* 1. Item Master Specifications */}
            <div className="rfq-specs-group-header">
              <span className="rfq-specs-group-title">
                Baseline Specifications from Item Master ({itemMasterSpecs.length})
              </span>
              <span className="rfq-specs-group-hint">
                Standard technical attributes pre-configured in catalog
              </span>
            </div>

            {itemMasterSpecs.map((spec) => (
              <div key={spec.id} className="rfq-spec-row rfq-spec-row--master">
                {editingSpecId === spec.id ? (
                  <div className="rfq-spec-edit-form">
                    <input
                      type="text"
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                      className="rfq-input rfq-input--sm"
                      placeholder="Spec name"
                    />
                    <input
                      type="text"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="rfq-input rfq-input--sm"
                      placeholder="Spec value"
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rfq-btn rfq-btn--sm rfq-btn--primary"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSpecId(null)}
                      className="rfq-btn rfq-btn--sm rfq-btn--outline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rfq-specs-col rfq-specs-col--key">
                      <span className="rfq-spec-key-text">{spec.key}</span>
                      {spec.category && (
                        <span className="rfq-spec-cat-hint">{spec.category}</span>
                      )}
                    </div>

                    <div className="rfq-specs-col rfq-specs-col--source">
                      <span className="rfq-pill-source rfq-pill-source--master">
                        <Layers size={11} />
                        Item Master
                      </span>
                    </div>

                    <div className="rfq-specs-col rfq-specs-col--val">
                      <span className="rfq-spec-val-text">{spec.value}</span>
                    </div>

                    <div className="rfq-specs-col rfq-specs-col--actions">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(spec)}
                        className="rfq-spec-action-btn"
                        title="Edit specification value"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(spec.id)}
                        className="rfq-spec-action-btn rfq-spec-action-btn--delete"
                        title="Remove specification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* 2. AI Suggested Additions */}
            {hasAIAdded && (
              <>
                <div className="rfq-specs-group-header rfq-specs-group-header--ai">
                  <span className="rfq-specs-group-title rfq-color-purple">
                    ✨ AI Suggested Procurement Criteria ({aiSuggestedSpecs.length})
                  </span>
                  <span className="rfq-specs-group-hint">
                    Enriched criteria recommended to avoid scope ambiguity with vendors
                  </span>
                </div>

                {aiSuggestedSpecs.map((spec) => (
                  <div
                    key={spec.id}
                    className={`rfq-spec-row rfq-spec-row--ai ${
                      spec.isAccepted ? 'rfq-spec-row--accepted' : ''
                    }`}
                  >
                    {editingSpecId === spec.id ? (
                      <div className="rfq-spec-edit-form">
                        <input
                          type="text"
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          className="rfq-input rfq-input--sm"
                          placeholder="Spec name"
                        />
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="rfq-input rfq-input--sm"
                          placeholder="Spec value"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="rfq-btn rfq-btn--sm rfq-btn--primary"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSpecId(null)}
                          className="rfq-btn rfq-btn--sm rfq-btn--outline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="rfq-specs-col rfq-specs-col--key">
                          <span className="rfq-spec-key-text">{spec.key}</span>
                          {spec.rationale && (
                            <span className="rfq-spec-rationale" title={spec.rationale}>
                              <Info size={11} />
                              {spec.rationale}
                            </span>
                          )}
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--source">
                          <span className="rfq-pill-source rfq-pill-source--ai">
                            <Sparkles size={11} />
                            AI Suggested
                          </span>
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--val">
                          <span className="rfq-spec-val-text rfq-spec-val-text--ai">
                            {spec.value}
                          </span>
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--actions">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(spec)}
                            className="rfq-spec-action-btn"
                            title="Edit AI suggestion"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(spec.id)}
                            className="rfq-spec-action-btn rfq-spec-action-btn--delete"
                            title="Remove AI suggestion"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* 3. Custom / User Additions */}
            {customSpecs.length > 0 && (
              <>
                <div className="rfq-specs-group-header">
                  <span className="rfq-specs-group-title">
                    Custom Specifications ({customSpecs.length})
                  </span>
                </div>

                {customSpecs.map((spec) => (
                  <div key={spec.id} className="rfq-spec-row rfq-spec-row--custom">
                    {editingSpecId === spec.id ? (
                      <div className="rfq-spec-edit-form">
                        <input
                          type="text"
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          className="rfq-input rfq-input--sm"
                        />
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="rfq-input rfq-input--sm"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="rfq-btn rfq-btn--sm rfq-btn--primary"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="rfq-specs-col rfq-specs-col--key">
                          <span className="rfq-spec-key-text">{spec.key}</span>
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--source">
                          <span className="rfq-pill-source rfq-pill-source--custom">
                            User Added
                          </span>
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--val">
                          <span className="rfq-spec-val-text">{spec.value}</span>
                        </div>

                        <div className="rfq-specs-col rfq-specs-col--actions">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(spec)}
                            className="rfq-spec-action-btn"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(spec.id)}
                            className="rfq-spec-action-btn rfq-spec-action-btn--delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Add Custom Specification Row */}
            {isAddingCustom ? (
              <div className="rfq-spec-new-form">
                <input
                  type="text"
                  placeholder="Specification Name (e.g. Color, Packing, Delivery terms)"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="rfq-input"
                />
                <input
                  type="text"
                  placeholder="Specification Value / Requirement"
                  value={customVal}
                  onChange={(e) => setCustomVal(e.target.value)}
                  className="rfq-input"
                />
                <div className="rfq-spec-new-form__btns">
                  <button
                    type="button"
                    onClick={handleAddCustomSpec}
                    className="rfq-btn rfq-btn--sm rfq-btn--primary"
                  >
                    Add Specification
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="rfq-btn rfq-btn--sm rfq-btn--outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rfq-specs-add-bar">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="rfq-btn rfq-btn--outline rfq-btn--sm"
                >
                  <Plus size={14} />
                  <span>Add Custom Specification</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQSpecificationStep;

