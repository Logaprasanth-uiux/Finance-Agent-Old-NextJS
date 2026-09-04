"use client";
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import type { RFQItemSelection, ItemSpecification } from '../../types/rfq';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Info,
  CheckCircle2,
  XCircle,
  Save,
  LayoutList
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string>('');
  const [editVal, setEditVal] = useState<string>('');

  const [addingAfterId, setAddingAfterId] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState<string>('');
  const [customVal, setCustomVal] = useState<string>('');
  const [customGroup, setCustomGroup] = useState<'product' | 'commercial'>('product');

  const currentSelection = selectedItems[activeItemIndex] || selectedItems[0];
  if (!currentSelection) {
    return null;
  }

  const handleEnrichWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const existingKeys = new Set(
        currentSelection.specifications.map((s) => s.key.toLowerCase())
      );
      
      let productSpecs: ItemSpecification[] = [];
      let commParams: ItemSpecification[] = [];

      try {
        const prodRes = await fetch(API_ENDPOINTS.productSpecs(currentSelection.item.id));
        if (prodRes.ok) {
          const data = await prodRes.json();
          if (Array.isArray(data)) {
            productSpecs = data.map((item: any, index: number) => ({
              id: `api-prod-${Date.now()}-${index}`,
              key: item.feature || `Feature ${index + 1}`,
              value: item.detail_requirement || '',
              source: 'api' as const,
              category: 'Product Requirement',
              specGroup: 'product' as const,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch product specs:', err);
      }

      try {
        const commRes = await fetch(API_ENDPOINTS.commercialParams);
        if (commRes.ok) {
          const data = await commRes.json();
          if (Array.isArray(data)) {
            commParams = data.map((item: any, index: number) => ({
              id: `api-com-${Date.now()}-${index}`,
              key: item.parameter_name || item.name || item.key || `Parameter ${index + 1}`,
              value: item.default_value || item.value || item.description || '',
              source: 'api' as const,
              category: 'Commercial Parameter',
              specGroup: 'commercial' as const,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch commercial params:', err);
      }

      let newSuggestions = currentSelection.item.aiSuggestions || [];
      
      // Fallback AI suggestions if the live database fetch fails or returns empty
      if (productSpecs.length === 0 && newSuggestions.length === 0) {
        newSuggestions = [
          {
            id: `ai-prod-${Date.now()}-1`,
            key: 'Material Quality',
            value: 'Must meet ISO 9001 standards',
            source: 'ai-suggested',
            category: 'Product Requirement',
            specGroup: 'product',
            rationale: 'Ensures baseline quality for enterprise use'
          },
          {
            id: `ai-prod-${Date.now()}-2`,
            key: 'Environmental Compliance',
            value: 'RoHS and REACH compliant',
            source: 'ai-suggested',
            category: 'Product Requirement',
            specGroup: 'product',
            rationale: 'Required for corporate sustainability goals'
          },
          {
            id: `ai-prod-${Date.now()}-3`,
            key: 'Packaging',
            value: 'Eco-friendly sustainable packaging',
            source: 'ai-suggested',
            category: 'Product Requirement',
            specGroup: 'product',
            rationale: 'Aligns with vendor ESG requirements'
          }
        ];
      }

      const standardCommercial = [
        { key: 'Unit Price', value: 'Specify the per-unit price without taxes', field: 'unit_price' },
        { key: 'Warranty', value: 'Duration and terms of warranty', field: 'warranty' },
        { key: 'GST %', value: 'Specify the applicable GST percentage', field: 'gst_percentage' },
        { key: 'Payment Terms', value: 'e.g., 30 days credit, 100% advance, etc.', field: 'payment_terms' },
        { key: 'Delivery Lead Time', value: 'Expected time for delivery after PO issuance', field: 'delivery_lead_time' },
        { key: 'Quotation Validity', value: 'Validity period of the quotation', field: 'quotation_validity' }
      ];

      const fallbackCommercial = standardCommercial.map((c, i) => ({
        id: `ai-com-${Date.now()}-${i}`,
        key: c.key,
        value: c.value,
        source: 'ai-suggested' as const,
        category: 'Commercial Parameter',
        specGroup: 'commercial' as const,
        rationale: `Standard commercial requirement (${c.field})`
      }));

      const finalProductSpecs = productSpecs.length > 0 ? productSpecs : newSuggestions.map((s) => ({ ...s, specGroup: 'product' as const }));
      const finalCommParams = commParams.length > 0 ? commParams : fallbackCommercial;

      const merged = [
        ...currentSelection.specifications,
        ...finalProductSpecs.filter((s) => !existingKeys.has(s.key.toLowerCase())),
        ...finalCommParams.filter((c) => !existingKeys.has(c.key.toLowerCase()))
      ];
      onUpdateSpecifications(currentSelection.item.id, merged);
    } catch (error) {
      console.error('Error in handleEnrichWithAI:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAllAI = () => {
    const updated = currentSelection.specifications.map((s) => ({
      ...s,
      isAccepted: true,
    }));
    onUpdateSpecifications(currentSelection.item.id, updated);
  };

  const handleSaveToDB = async () => {
    if (!currentSelection) return;
    setIsSaving(true);
    
    const productSpecs = currentSelection.specifications.filter(s => s.specGroup === 'product');
    const commSpecs = currentSelection.specifications.filter(s => s.specGroup === 'commercial');

    try {
      // 1. Post product specifications
      for (const spec of productSpecs) {
        await fetch(API_ENDPOINTS.productSpecsBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            org_id: 'ORG001',
            item_id: currentSelection.item.id,
            feature: spec.key,
            detail_requirement: spec.value,
          })
        });
      }

      // 2. Post commercial parameters
      // Attempt to map our generic keys to the specific CommercialParametersBase schema fields
      const commPayload: any = {
        org_id: 'ORG001',
        item_id: currentSelection.item.id,
        vendor_id: 'VD-ALL', // Placeholder since specs here are per-item, not per-vendor yet
      };

      commSpecs.forEach(spec => {
        const key = spec.key.toLowerCase();
        if (key.includes('price')) commPayload.unit_price = parseFloat(spec.value) || 0;
        else if (key.includes('gst')) commPayload.gst_percentage = parseFloat(spec.value) || 0;
        else if (key.includes('payment')) commPayload.payment_terms = spec.value;
        else if (key.includes('lead time')) commPayload.delivery_lead_time = spec.value;
        else if (key.includes('validity')) commPayload.quotation_validity = spec.value;
        else if (key.includes('warranty')) commPayload.warranty = spec.value;
      });

      await fetch(API_ENDPOINTS.commercialParams, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commPayload)
      });

    } catch (err) {
      console.error('Failed to save specifications to DB', err);
    } finally {
      setIsSaving(false);
      setActiveItemIndex(-1); // Collapse accordion on success
    }
  };

  const handleRejectAllAI = () => {
    const updated = currentSelection.specifications.filter((s) => s.source !== 'ai-suggested');
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
      specGroup: customGroup
    };

    const newSpecs = [...currentSelection.specifications];
    
    if (addingAfterId && addingAfterId !== 'empty-product' && addingAfterId !== 'empty-commercial') {
      const targetIndex = newSpecs.findIndex(s => s.id === addingAfterId);
      if (targetIndex !== -1) {
        newSpecs.splice(targetIndex + 1, 0, newSpec);
      } else {
        newSpecs.push(newSpec);
      }
    } else {
      newSpecs.push(newSpec);
    }

    onUpdateSpecifications(currentSelection.item.id, newSpecs);
    setCustomKey('');
    setCustomVal('');
    setAddingAfterId(null);
  };

  const productSpecs = currentSelection.specifications.filter((s) => s.specGroup !== 'commercial');
  const commercialSpecs = currentSelection.specifications.filter((s) => s.specGroup === 'commercial');

  const aiSpecs = currentSelection.specifications.filter(
    (s) => s.source === 'ai-suggested'
  );
  const hasAIApplied = aiSpecs.length > 0;
  const pendingAISpecs = aiSpecs.filter(s => !s.isAccepted);
  const hasPendingAI = pendingAISpecs.length > 0;

  return (
    <div className="rfq-step-layout">
      {/* Clean Step Heading */}
      <div className="rfq-step-heading-row">
        <h2 className="rfq-step-main-title">Step 2: Technical Specifications &amp; AI Enrichment</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {selectedItems.map((sel, idx) => {
          const isActive = idx === activeItemIndex;
          const hasAi = sel.specifications.some((s) => s.source === 'ai-suggested');

        return (
          <div 
            key={sel.item.id} 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              background: '#fff', 
              overflow: 'hidden', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
            }}
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => {
                setActiveItemIndex(isActive ? -1 : idx);
                setAddingAfterId(null);
                setEditingSpecId(null);
              }}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1.25rem 1.5rem', 
                background: isActive ? '#f8fafc' : '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1e293b' }}>{sel.item.name}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {sel.quantity} {sel.item.unit}
                </span>
                {hasAi && <span className="rfq-pill-ai-mini">✨ AI Enriched</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{sel.specifications.length} Specs</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease-in-out' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>

            {/* Accordion Body / Workspace */}
            {isActive && currentSelection && (
              <div className="rfq-spec-workspace" style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                {/* Active Item Context Header Banner */}
                <div className="rfq-spec-header-card">
                  <div className="rfq-spec-header-card__info">
                    <div className="rfq-spec-header-card__tag-row">
                      <span className="rfq-spec-header-card__model">
                        ID: {currentSelection.item.id}
                      </span>
                      <span className="rfq-spec-header-card__category">
                        {currentSelection.item.category}
                      </span>
                    </div>
                    <h3 className="rfq-spec-header-card__name">
                      Configure Specs for {currentSelection.item.name}
                    </h3>
                  </div>

                  <div className="rfq-spec-header-card__actions">
                    <button
                      type="button"
                      onClick={handleEnrichWithAI}
                      disabled={isAnalyzing || hasPendingAI}
                      className={`rfq-btn rfq-btn--ai ${hasPendingAI ? 'rfq-btn--ai-done' : ''}`}
                      title="Identify missing procurement and technical criteria with AI"
                    >
                      <Sparkles size={16} className={isAnalyzing ? 'rfq-spin' : ''} />
                      <span>
                        {isAnalyzing
                          ? 'Analyzing Item Master Specs...'
                          : hasPendingAI
                          ? 'AI Specifications Applied'
                          : 'Complete Specification with AI'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* AI Insight Bar when enriched */}
                {hasPendingAI && (
                  <div className="rfq-ai-callout">
                    <div className="rfq-ai-callout__icon">
                      <Sparkles size={18} />
                    </div>
                    <div className="rfq-ai-callout__content">
                      <div className="rfq-ai-callout__title">
                        AI Spec Analysis Complete: {pendingAISpecs.length} Procurement Additions Suggested
                      </div>
                      <div className="rfq-ai-callout__desc">
                        Identified key enterprise criteria missing from base Item Master (Warranty, Port Standards, Battery, and Support SLA). You can accept, edit, or remove each item before finalizing.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleAcceptAllAI}
                        className="rfq-btn rfq-btn--sm rfq-btn--ai-outline"
                      >
                        <CheckCircle2 size={13} />
                        <span>Accept All</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectAllAI}
                        className="rfq-btn rfq-btn--sm"
                        style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: '#fef2f2' }}
                      >
                        <XCircle size={13} />
                        <span>Reject All</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="rfq-specs-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <LayoutList size={20} color="#4F46E5" />
                       <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Generated Specifications</h2>
                    </div>
                    <button 
                       className="rfq-btn" 
                       onClick={handleSaveToDB}
                       disabled={isSaving}
                       style={{ 
                         background: isSaving ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                         color: '#ffffff', 
                         padding: '0.6rem 1.2rem', 
                         borderRadius: '6px', 
                         fontSize: '0.9rem', 
                         fontWeight: 600, 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '8px', 
                         border: 'none',
                         boxShadow: isSaving ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                         cursor: isSaving ? 'not-allowed' : 'pointer',
                         transition: 'all 0.2s ease-in-out'
                       }}
                       onMouseEnter={(e) => {
                         if (isSaving) return;
                         e.currentTarget.style.transform = 'translateY(-2px)';
                         e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         if (isSaving) return;
                         e.currentTarget.style.transform = 'translateY(0)';
                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                       }}
                    >
                       {isSaving ? (
                         <>
                           <div style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                           Saving...
                         </>
                       ) : (
                         <>
                           <Save size={18} />
                           Save Specifications
                         </>
                       )}
                    </button>
                  </div>

                  {/* Product Specifications Table */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                      Product Specifications
                    </h3>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '30% 60% 10%', background: '#f8fafc', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        <div>Feature / Component</div>
                        <div>Detailed Requirement</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                      </div>
                      
                      {productSpecs.length === 0 && addingAfterId !== 'empty-product' && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                          No product specifications. Generate with AI or <button onClick={() => { setCustomGroup('product'); setAddingAfterId('empty-product'); }} style={{ color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>add manually</button>.
                        </div>
                      )}

                      {addingAfterId === 'empty-product' && (
                        <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input type="text" placeholder="Feature / Component" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="rfq-input" style={{ flex: 1 }} />
                          <input type="text" placeholder="Detailed Requirement" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="rfq-input" style={{ flex: 2 }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={handleAddCustomSpec} className="rfq-btn rfq-btn--sm rfq-btn--primary">Add</button>
                            <button type="button" onClick={() => setAddingAfterId(null)} className="rfq-btn rfq-btn--sm rfq-btn--outline">Cancel</button>
                          </div>
                        </div>
                      )}
                      
                      {productSpecs.map((spec, i) => (
                        <React.Fragment key={spec.id}>
                          <div style={{ display: 'grid', gridTemplateColumns: '30% 60% 10%', padding: '0.75rem 1rem', borderBottom: (i === productSpecs.length - 1 && addingAfterId !== spec.id) ? 'none' : '1px solid #f1f5f9', alignItems: 'center', fontSize: '0.85rem', color: '#334155' }}>
                            {editingSpecId === spec.id ? (
                              <>
                                <div>
                                  <input
                                    type="text"
                                    value={editKey}
                                    onChange={(e) => setEditKey(e.target.value)}
                                    className="rfq-input rfq-input--sm"
                                    style={{ width: '90%' }}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={editVal}
                                    onChange={(e) => setEditVal(e.target.value)}
                                    className="rfq-input rfq-input--sm"
                                    style={{ width: '90%' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button onClick={handleSaveEdit} className="rfq-btn rfq-btn--sm rfq-btn--primary">Save</button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {spec.key}
                                    {spec.rationale && (
                                      <span className="rfq-spec-rationale" title={spec.rationale}>
                                        <Info size={11} />
                                      </span>
                                    )}
                                  </div>
                                  {spec.source === 'item-master' && (
                                    <span className="rfq-pill-source rfq-pill-source--master" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      <Layers size={11} /> Item Master
                                    </span>
                                  )}
                                  {spec.source === 'ai-suggested' && (
                                    <span className="rfq-pill-source rfq-pill-source--ai" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      <Sparkles size={11} /> AI Suggested
                                    </span>
                                  )}
                                  {spec.source === 'custom' && (
                                    <span className="rfq-pill-source rfq-pill-source--custom" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      User Added
                                    </span>
                                  )}
                                </div>
                                <div style={{ color: '#475569' }}>
                                  <span className={spec.source === 'ai-suggested' ? 'rfq-spec-val-text--ai' : ''}>{spec.value}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => { setCustomGroup('product'); setAddingAfterId(spec.id); }} style={{ color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Add Below">
                                    <Plus size={15} />
                                  </button>
                                  <button onClick={() => handleStartEdit(spec)} style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit">
                                    <Edit2 size={15} />
                                  </button>
                                  <button onClick={() => handleRemoveSpec(spec.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {addingAfterId === spec.id && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: i === productSpecs.length - 1 ? 'none' : '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <input type="text" placeholder="Feature / Component" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="rfq-input" style={{ flex: 1 }} />
                              <input type="text" placeholder="Detailed Requirement" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="rfq-input" style={{ flex: 2 }} />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={handleAddCustomSpec} className="rfq-btn rfq-btn--sm rfq-btn--primary">Add</button>
                                <button type="button" onClick={() => setAddingAfterId(null)} className="rfq-btn rfq-btn--sm rfq-btn--outline">Cancel</button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Parameters Table */}
                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                      Commercial Parameters
                    </h3>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '30% 60% 10%', background: '#f8fafc', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        <div>Feature / Component</div>
                        <div>Detailed Requirement</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                      </div>
                      
                      {commercialSpecs.length === 0 && addingAfterId !== 'empty-commercial' && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                          No commercial parameters. Generate with AI or <button onClick={() => { setCustomGroup('commercial'); setAddingAfterId('empty-commercial'); }} style={{ color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>add manually</button>.
                        </div>
                      )}

                      {addingAfterId === 'empty-commercial' && (
                        <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input type="text" placeholder="Feature / Component" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="rfq-input" style={{ flex: 1 }} />
                          <input type="text" placeholder="Detailed Requirement" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="rfq-input" style={{ flex: 2 }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={handleAddCustomSpec} className="rfq-btn rfq-btn--sm rfq-btn--primary">Add</button>
                            <button type="button" onClick={() => setAddingAfterId(null)} className="rfq-btn rfq-btn--sm rfq-btn--outline">Cancel</button>
                          </div>
                        </div>
                      )}
                      
                      {commercialSpecs.map((spec, i) => (
                        <React.Fragment key={spec.id}>
                          <div style={{ display: 'grid', gridTemplateColumns: '30% 60% 10%', padding: '0.75rem 1rem', borderBottom: (i === commercialSpecs.length - 1 && addingAfterId !== spec.id) ? 'none' : '1px solid #f1f5f9', alignItems: 'center', fontSize: '0.85rem', color: '#334155' }}>
                            {editingSpecId === spec.id ? (
                              <>
                                <div>
                                  <input
                                    type="text"
                                    value={editKey}
                                    onChange={(e) => setEditKey(e.target.value)}
                                    className="rfq-input rfq-input--sm"
                                    style={{ width: '90%' }}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={editVal}
                                    onChange={(e) => setEditVal(e.target.value)}
                                    className="rfq-input rfq-input--sm"
                                    style={{ width: '90%' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button onClick={handleSaveEdit} className="rfq-btn rfq-btn--sm rfq-btn--primary">Save</button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {spec.key}
                                    {spec.rationale && (
                                      <span className="rfq-spec-rationale" title={spec.rationale}>
                                        <Info size={11} />
                                      </span>
                                    )}
                                  </div>
                                  {spec.source === 'item-master' && (
                                    <span className="rfq-pill-source rfq-pill-source--master" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      <Layers size={11} /> Item Master
                                    </span>
                                  )}
                                  {spec.source === 'ai-suggested' && (
                                    <span className="rfq-pill-source rfq-pill-source--ai" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      <Sparkles size={11} /> AI Suggested
                                    </span>
                                  )}
                                  {spec.source === 'custom' && (
                                    <span className="rfq-pill-source rfq-pill-source--custom" style={{ width: 'fit-content', zoom: 0.85 }}>
                                      User Added
                                    </span>
                                  )}
                                </div>
                                <div style={{ color: '#475569' }}>
                                  <span className={spec.source === 'ai-suggested' ? 'rfq-spec-val-text--ai' : ''}>{spec.value}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => { setCustomGroup('commercial'); setAddingAfterId(spec.id); }} style={{ color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Add Below">
                                    <Plus size={15} />
                                  </button>
                                  <button onClick={() => handleStartEdit(spec)} style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit">
                                    <Edit2 size={15} />
                                  </button>
                                  <button onClick={() => handleRemoveSpec(spec.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {addingAfterId === spec.id && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: i === commercialSpecs.length - 1 ? 'none' : '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <input type="text" placeholder="Feature / Component" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="rfq-input" style={{ flex: 1 }} />
                              <input type="text" placeholder="Detailed Requirement" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="rfq-input" style={{ flex: 2 }} />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={handleAddCustomSpec} className="rfq-btn rfq-btn--sm rfq-btn--primary">Add</button>
                                <button type="button" onClick={() => setAddingAfterId(null)} className="rfq-btn rfq-btn--sm rfq-btn--outline">Cancel</button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RFQSpecificationStep;
