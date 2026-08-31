export type ReconciliationStatus = 
  | 'Fully Reconciled' 
  | 'Partially Matched' 
  | 'Needs Review' 
  | 'Posted';

export type ERPStatus = 
  | 'Ready to Post' 
  | 'Posted' 
  | 'Pending Match' 
  | 'On Hold';

export type LinkedRecordType = 
  | 'Purchase Order' 
  | 'Bank Statement Line' 
  | 'TDS Certificate' 
  | 'SAP Clearing Doc' 
  | 'Customer Ledger'
  | 'Remittance Advice';

export interface LinkedRecord {
  id: string;
  type: LinkedRecordType;
  reference: string;
  amount?: number;
  date: string;
  status: string;
  details?: string;
}

export interface MatchedInvoice {
  id: string;
  sapDoc: string;
  docRef: string;
  docDate: string;
  txnDate: string;
  description: string;
  grossAmount: number;
  tdsAmount: number;
  tdsSection?: string;
  advanceAdjusted: number;
  netAmount: number;
  matchStatus: '100% Exact Match' | 'Rule-Based Match' | 'AI Suggested Match' | 'Manual Match';
  erpStatus?: ERPStatus;
  linkedRecords: LinkedRecord[];
}

export interface SuggestedInvoiceMatch {
  invoice: MatchedInvoice;
  confidenceScore: number;
  matchReasons: string[];
}

export interface PaymentAttachment {
  name: string;
  size: string;
  url: string;
  type: 'pdf';
}

export interface ARPayment {
  id: string;
  sender: string;
  senderAccount?: string;
  senderEmail?: string;
  senderLogoInitial?: string;
  senderColor?: string;
  paymentAmount: number;
  matchedAmount: number;
  remainingAmount: number;
  receivedDate: string;
  receivedTime: string;
  paymentRef: string;
  paymentChannel: string;
  status: ReconciliationStatus;
  erpStatus: ERPStatus;
  sapDoc: string;
  postedAt?: string;
  matchedInvoices: MatchedInvoice[];
  suggestedMatches?: SuggestedInvoiceMatch[];
  notes?: string;
  attachment?: PaymentAttachment;
  attachments?: PaymentAttachment[];
}
