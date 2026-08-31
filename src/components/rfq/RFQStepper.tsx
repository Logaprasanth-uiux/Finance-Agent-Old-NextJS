"use client";
import React from 'react';
import { Package, Cpu, Users, Send, Check, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export type RFQStep = 1 | 2 | 3 | 4;

interface RFQStepperProps {
  currentStep: RFQStep;
  completedSteps: RFQStep[];
  onStepClick: (step: RFQStep) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  isSubmitting?: boolean;
  onExitToLanding?: () => void;
}

interface StepConfig {
  number: RFQStep;
  title: string;
  shortLabel: string;
  icon: React.ElementType;
}

const steps: StepConfig[] = [
  {
    number: 1,
    title: 'Select Items',
    shortLabel: '1. Items',
    icon: Package,
  },
  {
    number: 2,
    title: 'Product Specifications',
    shortLabel: '2. Specifications',
    icon: Cpu,
  },
  {
    number: 3,
    title: 'Select Vendors',
    shortLabel: '3. Vendors',
    icon: Users,
  },
  {
    number: 4,
    title: 'Review & Send',
    shortLabel: '4. Review & Send',
    icon: Send,
  },
];

export const RFQStepper: React.FC<RFQStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  onBack,
  onContinue,
  canContinue = true,
  continueLabel,
  isSubmitting = false,
  onExitToLanding,
}) => {
  const getDefaultContinueLabel = () => {
    switch (currentStep) {
      case 1:
        return 'Continue to Specifications';
      case 2:
        return 'Continue to Vendors';
      case 3:
        return 'Review RFQ';
      case 4:
        return 'Send RFQ to Vendors';
    }
  };

  return (
    <div className="rfq-bottom-sticky-bar">
      <div className="rfq-bottom-sticky-bar__inner">
        {/* Left Side: Stepper Progress */}
        <div className="rfq-bottom-stepper">
          {steps.map((step, idx) => {
            const isCurrent = currentStep === step.number;
            const isCompleted = completedSteps.includes(step.number) && !isCurrent;
            const isClickable = isCompleted || step.number < currentStep;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.number}>
                <div
                  className={`rfq-bottom-step-node ${
                    isCurrent ? 'rfq-bottom-step-node--active' : ''
                  } ${isCompleted ? 'rfq-bottom-step-node--completed' : ''} ${
                    isClickable ? 'rfq-bottom-step-node--clickable' : ''
                  }`}
                  onClick={() => isClickable && onStepClick(step.number)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                >
                  <div className="rfq-bottom-step-circle">
                    {isCompleted ? (
                      <Check size={14} className="rfq-step-check" />
                    ) : (
                      <Icon size={14} />
                    )}
                  </div>
                  <div className="rfq-bottom-step-text">
                    <span className="rfq-bottom-step-title">{step.title}</span>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`rfq-bottom-step-line ${
                      completedSteps.includes(step.number) || currentStep > step.number
                        ? 'rfq-bottom-step-line--completed'
                        : ''
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Side: Navigation Action Buttons */}
        <div className="rfq-bottom-actions">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onExitToLanding}
              className="rfq-btn rfq-btn--ghost"
            >
              <ArrowLeft size={15} />
              <span>Cancel &amp; Exit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="rfq-btn rfq-btn--outline"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue || isSubmitting}
            className="rfq-btn rfq-btn--primary rfq-btn--glow"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="rfq-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{continueLabel || getDefaultContinueLabel()}</span>
                {currentStep === 4 ? <Send size={15} /> : <ArrowRight size={15} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFQStepper;

