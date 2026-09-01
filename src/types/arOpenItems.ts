export type OpenItemSourceType = 'Bank' | 'On Account' | 'Invoice' | '26AS' | 'TDS';

export type OpenItemStatus = 'Ready to Post' | 'Posted' | 'On Hold';

export interface OpenItemColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

export interface OpenItemDetailField {
  label: string;
  value: string;
}

export interface OpenItemDisplayRow {
  id: string;
  contextId: string;
  status: OpenItemStatus;
  /** Formatted values aligned 1:1 with the source's column config (excluding Action) */
  cells: string[];
  /** Extra metadata surfaced only when the row is expanded */
  detail: OpenItemDetailField[];
  /** ISO yyyy-mm-dd, used by the Transaction Date quick filter */
  txnDate: string;
  /** Structured counterparty/customer/deductor name, used by the Company filter */
  company: string;
}

export interface OpenItemSourceView {
  columns: OpenItemColumn[];
  rows: OpenItemDisplayRow[];
}

export type DateFilterBucket = 'All Time' | 'Last 7 Days' | 'This Month' | 'Last Month';

export const dateFilterBuckets: DateFilterBucket[] = [
  'All Time',
  'Last 7 Days',
  'This Month',
  'Last Month',
];

/** Per-source label for the Company filter — each tab calls its counterparty something different */
export const companyFilterLabels: Record<OpenItemSourceType, string> = {
  Bank: 'Counterparty',
  'On Account': 'Customer',
  Invoice: 'Customer',
  '26AS': 'Deductor',
  TDS: 'Deductor',
};

/** Plural form for the "All ___" dropdown option — irregular for Counterparty */
export const companyFilterPluralLabels: Record<OpenItemSourceType, string> = {
  Bank: 'Counterparties',
  'On Account': 'Customers',
  Invoice: 'Customers',
  '26AS': 'Deductors',
  TDS: 'Deductors',
};
