export interface ItemSpecification {
  id: string;
  key: string;
  value: string;
  source: 'item-master' | 'ai-suggested' | 'custom';
  category?: string;
  rationale?: string;
  isAccepted?: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  model: string;
  category: string;
  unit: string;
  defaultQuantity: number;
  baseSpecs: ItemSpecification[];
  aiSuggestions: ItemSpecification[];
  badge?: string;
}

export interface RFQItemSelection {
  item: CatalogItem;
  quantity: number;
  specifications: ItemSpecification[];
  aiEnriched: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  rating: number;
  relationshipStatus: 'Preferred Partner' | 'Approved Supplier' | 'Verified Vendor' | 'Contracted';
  email: string;
  phone: string;
  leadTime: string;
  paymentTerms: string;
  logoInitial?: string;
  logoColor?: string;
}

export interface RFQVendorSubmissionStatus {
  vendorId: string;
  vendorName: string;
  status: 'Sent' | 'Awaiting Response' | 'Quote Received' | 'Under Evaluation';
  sentDate: string;
  expectedDueDate: string;
  quoteAmount?: number;
}

export interface RFQSubmissionResult {
  rfqNumber: string;
  company?: string;
  createdDate: string;
  quoteDueDate: string;
  deliveryLocation: string;
  items: RFQItemSelection[];
  vendors: Vendor[];
  vendorStatuses: RFQVendorSubmissionStatus[];
  notes: string;
}

export type RFQStatus =
  | 'Draft'
  | 'Sent to Vendors'
  | 'Awaiting Quotations'
  | 'Quotations Received'
  | 'Closing Soon'
  | 'Closed';

export interface QuotedItem {
  itemId: string;
  itemName: string;
  model: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface VendorQuotation {
  quotationNumber: string;
  vendorId: string;
  vendorName: string;
  submittedDate: string;
  submittedTime: string;
  quotedItems: QuotedItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  deliveryTimeline: string;
  paymentTerms: string;
  validityDate: string;
  vendorComments: string;
}

export interface VendorResponse {
  vendorId: string;
  vendorName: string;
  status: 'Quotation Received' | 'Awaiting Response' | 'Quotation Approved';
  quotationValue?: number;
  submittedDate?: string;
  submittedTime?: string;
  quotation?: VendorQuotation;
  sentDate?: string;
  responseDeadline?: string;
  approvedDate?: string;
}

export interface RFQRecord {
  id: string;
  rfqNumber: string;
  company?: string;
  title: string;
  itemsSummary: string;
  itemCount: number;
  totalQuantity: number;
  vendorCount: number;
  vendors: string[];
  createdDate: string;
  deadlineDate: string;
  timeRemaining: string;
  isUrgent?: boolean;
  status: RFQStatus;
  estimatedBudget?: number;
  quotesReceivedCount?: number;
  category: string;
  isLocked?: boolean;
  deliveryLocation?: string;
  notes?: string;
  itemsDetail?: RFQItemSelection[];
  vendorResponses?: VendorResponse[];
}



