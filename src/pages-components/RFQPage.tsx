"use client";
import React, { useState } from 'react';
import type {
  CatalogItem,
  RFQItemSelection,
  Vendor,
  ItemSpecification,
  RFQSubmissionResult,
  RFQVendorSubmissionStatus,
  RFQRecord,
  VendorQuotation,
} from '../types/rfq';
import { mockRFQCompanies } from '../data/rfqMockData';
import RFQLandingHome from '../components/rfq/RFQLandingHome';
import RFQStepper, { type RFQStep } from '../components/rfq/RFQStepper';
import RFQItemsStep from '../components/rfq/RFQItemsStep';
import RFQSpecificationStep from '../components/rfq/RFQSpecificationStep';
import RFQVendorsStep from '../components/rfq/RFQVendorsStep';
import RFQReviewStep from '../components/rfq/RFQReviewStep';
import RFQDetailView from '../components/rfq/RFQDetailView';
import VendorQuotationModal from '../components/rfq/VendorQuotationModal';
import RFQAddNewItemModal from '../components/rfq/RFQAddNewItemModal';
import RFQAddNewVendorModal from '../components/rfq/RFQAddNewVendorModal';
import { ArrowLeft, Building2, Package, Lock } from 'lucide-react';

export const RFQPage: React.FC = () => {
  // Page mode: 'landing' | 'builder' (4-step wizard) | 'detail' (read-only sent RFQ)
  const [viewMode, setViewMode] = useState<'landing' | 'builder' | 'detail'>('landing');
  const [activeDetailRFQ, setActiveDetailRFQ] = useState<RFQRecord | null>(null);
  const [activeQuotationVendor, setActiveQuotationVendor] =
    useState<VendorQuotation | null>(null);

  const [currentStep, setCurrentStep] = useState<RFQStep>(1);
  const [completedSteps, setCompletedSteps] = useState<RFQStep[]>([]);

  // Company / Legal Entity Context (Context for the entire RFQ workspace)
  const [selectedCompany, setSelectedCompany] = useState<string>(
    mockRFQCompanies[0]
  );

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

  // Initial State: Start clean with 0 Products and 0 Vendors for newly created RFQs
  const [selectedItems, setSelectedItems] = useState<RFQItemSelection[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);

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

  const handleAddBulkItems = (newSelections: { item: CatalogItem; quantity: number }[]) => {
    setSelectedItems((prev) => {
      const existingIds = new Set(prev.map((s) => s.item.id));
      const toAdd = newSelections.filter((s) => !existingIds.has(s.item.id));
      const formatted: RFQItemSelection[] = toAdd.map((sel) => ({
        item: sel.item,
        quantity: sel.quantity,
        specifications: [...sel.item.baseSpecs],
        aiEnriched: false,
      }));
      return [...prev, ...formatted];
    });
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
    setSelectedVendors([]);
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
        company: selectedCompany,
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
    setSelectedItems([]);
    setSelectedVendors([]);
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

  const handleViewRFQ = (rfq: RFQRecord) => {
    setActiveDetailRFQ(rfq);
    setViewMode('detail');
  };

  const handleEditDraft = (rfq: RFQRecord) => {
    if (rfq.company) {
      setSelectedCompany(rfq.company);
    }
    if (rfq.itemsDetail && rfq.itemsDetail.length > 0) {
      setSelectedItems([...rfq.itemsDetail]);
    } else {
      setSelectedItems([]);
    }
    setSelectedVendors([]);
    setCurrentStep(1);
    setCompletedSteps([]);
    setSubmissionResult(null);
    setViewMode('builder');
  };

  // If in Detail Mode, render the dedicated Read-Only RFQ Detail View
  if (viewMode === 'detail' && activeDetailRFQ) {
    return (
      <div className="rfq-page-wrapper">
        <RFQDetailView
          rfq={activeDetailRFQ}
          onBackToHub={() => setViewMode('landing')}
        />
      </div>
    );
  }

  // If in Landing Mode, render the full RFQ Hub Dashboard
  if (viewMode === 'landing') {
    return (
      <div className="rfq-page-wrapper">
        <RFQLandingHome
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          companies={mockRFQCompanies}
          onCreateNewRFQ={() => {
            setCurrentStep(1);
            setSubmissionResult(null);
            setSelectedItems([]);
            setSelectedVendors([]);
            setViewMode('builder');
          }}
          onViewRFQ={handleViewRFQ}
          onEditDraft={handleEditDraft}
        />
      </div>
    );
  }

  // Builder Mode: 4-Step RFQ Creation with Sticky Bottom Stepper
  return (
    <div className="rfq-page-wrapper rfq-page-wrapper--builder">
      {/* Main Step Workspace */}
      <main className="rfq-main-content rfq-main-content--with-bottom-bar">
        {currentStep === 1 && (
          <RFQItemsStep
            selectedItems={selectedItems}
            selectedCompany={selectedCompany}
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
            selectedCompany={selectedCompany}
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

      {/* Informational & Upload Pathway Modals */}
      <RFQAddNewItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddBulkItems={handleAddBulkItems}
      />

      <RFQAddNewVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
      />
    </div>
  );
};

export default RFQPage;

