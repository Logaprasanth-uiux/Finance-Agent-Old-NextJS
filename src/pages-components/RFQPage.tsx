"use client";
import React, { useState } from 'react';
import type {
  CatalogItem,
  RFQItemSelection,
  Vendor,
  ItemSpecification,
  RFQSubmissionResult,
  RFQVendorSubmissionStatus,
} from '../types/rfq';
import { mockCatalogItems, mockVendors } from '../data/rfqMockData';
import RFQLandingHome from '../components/rfq/RFQLandingHome';
import RFQStepper, { type RFQStep } from '../components/rfq/RFQStepper';
import RFQItemsStep from '../components/rfq/RFQItemsStep';
import RFQSpecificationStep from '../components/rfq/RFQSpecificationStep';
import RFQVendorsStep from '../components/rfq/RFQVendorsStep';
import RFQReviewStep from '../components/rfq/RFQReviewStep';
import RFQAddNewItemModal from '../components/rfq/RFQAddNewItemModal';
import RFQAddNewVendorModal from '../components/rfq/RFQAddNewVendorModal';
import { ArrowLeft, Building2, Package } from 'lucide-react';

export const RFQPage: React.FC = () => {
  // Page mode: 'landing' (dashboard of running/active RFQs) vs 'builder' (4-step creation)
  const [viewMode, setViewMode] = useState<'landing' | 'builder'>('landing');
  const [currentStep, setCurrentStep] = useState<RFQStep>(1);
  const [completedSteps, setCompletedSteps] = useState<RFQStep[]>([]);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  // Review step parameters
  const [quoteDueDate, setQuoteDueDate] = useState<string>('2026-09-10');
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    'DataTwin Corporate HQ — Bangalore Tech Park, Tower B'
  );
  const [notes, setNotes] = useState<string>(
    'Please include standard enterprise warranty, GST breakout, and volume discounting in commercial quotation.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] =
    useState<RFQSubmissionResult | null>(null);

  // Initial State: HP Laptop pre-selected with base specs
  const initialItem = mockCatalogItems[0];
  const [selectedItems, setSelectedItems] = useState<RFQItemSelection[]>([
    {
      item: initialItem,
      quantity: 10,
      specifications: [...initialItem.baseSpecs],
      aiEnriched: false,
    },
  ]);

  // Initial Vendors: First 3 vendors pre-selected for rich immediate demo
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([
    mockVendors[0],
    mockVendors[1],
    mockVendors[2],
  ]);

  // Mark step complete when advancing
  const markStepComplete = (step: RFQStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const handleAddItem = (item: CatalogItem, quantity = 10) => {
    if (selectedItems.some((sel) => sel.item.id === item.id)) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        item,
        quantity,
        specifications: [...item.baseSpecs],
        aiEnriched: false,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((sel) => sel.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((sel) =>
        sel.item.id === itemId ? { ...sel, quantity } : sel
      )
    );
  };

  const handleUpdateSpecifications = (
    itemId: string,
    specifications: ItemSpecification[]
  ) => {
    setSelectedItems((prev) =>
      prev.map((sel) =>
        sel.item.id === itemId
          ? {
              ...sel,
              specifications,
              aiEnriched: specifications.some((s) => s.source === 'ai-suggested'),
            }
          : sel
      )
    );
  };

  const handleToggleVendor = (vendor: Vendor) => {
    if (selectedVendors.some((v) => v.id === vendor.id)) {
      setSelectedVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } else {
      setSelectedVendors((prev) => [...prev, vendor]);
    }
  };

  const handleSelectAllVendors = () => {
    setSelectedVendors([...mockVendors]);
  };

  const handleClearAllVendors = () => {
    setSelectedVendors([]);
  };

  const handleSendRFQ = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const statuses: RFQVendorSubmissionStatus[] = selectedVendors.map((v) => ({
        vendorId: v.id,
        vendorName: v.name,
        status: 'Sent',
        sentDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        expectedDueDate: quoteDueDate,
      }));

      const result: RFQSubmissionResult = {
        rfqNumber: `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        quoteDueDate,
        deliveryLocation,
        items: selectedItems,
        vendors: selectedVendors,
        vendorStatuses: statuses,
        notes,
      };

      setSubmissionResult(result);
      setIsSubmitting(false);
      markStepComplete(4);
    }, 1100);
  };

  const handleResetDemo = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setSubmissionResult(null);
    const defaultItem = mockCatalogItems[0];
    setSelectedItems([
      {
        item: defaultItem,
        quantity: 10,
        specifications: [...defaultItem.baseSpecs],
        aiEnriched: false,
      },
    ]);
    setSelectedVendors([mockVendors[0], mockVendors[1], mockVendors[2]]);
    setViewMode('landing');
  };

  const handleBottomContinue = () => {
    if (currentStep === 1) {
      markStepComplete(1);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      markStepComplete(2);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      markStepComplete(3);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleSendRFQ();
    }
  };

  const handleBottomBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
  };

  // If in Landing Mode, render the full RFQ Hub Dashboard
  if (viewMode === 'landing') {
    return (
      <div className="rfq-page-wrapper">
        <RFQLandingHome
          onCreateNewRFQ={() => {
            setCurrentStep(1);
            setSubmissionResult(null);
            setViewMode('builder');
          }}
        />
      </div>
    );
  }

  // Builder Mode: 4-Step RFQ Creation with Sticky Bottom Stepper
  return (
    <div className="rfq-page-wrapper rfq-page-wrapper--builder">
      {/* Top Header / Breadcrumb Navigation */}
      <div className="rfq-builder-top-bar">
        <button
          type="button"
          onClick={() => setViewMode('landing')}
          className="rfq-back-to-hub-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to RFQ Hub</span>
        </button>

        <div className="rfq-builder-title-block">
          <span className="rfq-builder-draft-tag">Draft RFQ</span>
          <h2 className="rfq-builder-title">
            {currentStep === 1 && 'Step 1: Select Items & Quantities'}
            {currentStep === 2 && 'Step 2: Technical Specifications & AI Enrichment'}
            {currentStep === 3 && 'Step 3: Supplier & Vendor Selection'}
            {currentStep === 4 && 'Step 4: Final Review & Dispatch'}
          </h2>
        </div>

        <div className="rfq-builder-quick-stats">
          <span className="rfq-stat-chip">
            <Package size={13} className="rfq-icon-indigo" />
            {selectedItems.length} Products ({selectedItems.reduce((a, b) => a + b.quantity, 0)} Units)
          </span>
          <span className="rfq-stat-chip">
            <Building2 size={13} className="rfq-icon-indigo" />
            {selectedVendors.length} Vendors Invited
          </span>
        </div>
      </div>

      {/* Main Step Workspace */}
      <main className="rfq-main-content rfq-main-content--with-bottom-bar">
        {currentStep === 1 && (
          <RFQItemsStep
            selectedItems={selectedItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenAddNewItemModal={() => setIsAddItemModalOpen(true)}
          />
        )}

        {currentStep === 2 && (
          <RFQSpecificationStep
            selectedItems={selectedItems}
            onUpdateSpecifications={handleUpdateSpecifications}
          />
        )}

        {currentStep === 3 && (
          <RFQVendorsStep
            selectedVendors={selectedVendors}
            onToggleVendor={handleToggleVendor}
            onSelectAll={handleSelectAllVendors}
            onClearAll={handleClearAllVendors}
            onOpenAddNewVendorModal={() => setIsAddVendorModalOpen(true)}
          />
        )}

        {currentStep === 4 && (
          <RFQReviewStep
            selectedItems={selectedItems}
            selectedVendors={selectedVendors}
            onReset={handleResetDemo}
            isSubmitting={isSubmitting}
            submissionResult={submissionResult}
            quoteDueDate={quoteDueDate}
            setQuoteDueDate={setQuoteDueDate}
            deliveryLocation={deliveryLocation}
            setDeliveryLocation={setDeliveryLocation}
            notes={notes}
            setNotes={setNotes}
            handleSendRFQ={handleSendRFQ}
          />
        )}
      </main>

      {/* Sticky Bottom Stepper & Action Bar (Hidden when successfully dispatched) */}
      {!submissionResult && (
        <RFQStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(step) => setCurrentStep(step)}
          onBack={handleBottomBack}
          onContinue={handleBottomContinue}
          canContinue={
            currentStep === 1
              ? selectedItems.length > 0
              : currentStep === 3
              ? selectedVendors.length > 0
              : true
          }
          isSubmitting={isSubmitting}
          onExitToLanding={() => setViewMode('landing')}
        />
      )}

      {/* Informational Pathway Modals */}
      <RFQAddNewItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
      />

      <RFQAddNewVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
      />
    </div>
  );
};

export default RFQPage;

