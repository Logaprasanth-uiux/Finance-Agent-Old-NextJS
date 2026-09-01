"use client";
import React from 'react';
import { X } from 'lucide-react';
import type { DateFilterBucket } from '../../types/arOpenItems';
import { dateFilterBuckets } from '../../types/arOpenItems';

interface AROpenItemsSecondaryFiltersProps {
  dateFilter: DateFilterBucket;
  onDateFilterChange: (bucket: DateFilterBucket) => void;
  companyLabel: string;
  companyPluralLabel: string;
  companyFilter: string;
  onCompanyFilterChange: (company: string) => void;
  companyOptions: string[];
  onClear: () => void;
}

export const AROpenItemsSecondaryFilters: React.FC<AROpenItemsSecondaryFiltersProps> = ({
  dateFilter,
  onDateFilterChange,
  companyLabel,
  companyPluralLabel,
  companyFilter,
  onCompanyFilterChange,
  companyOptions,
  onClear,
}) => {
  const hasActiveFilters = dateFilter !== 'All Time' || companyFilter !== '';

  return (
    <div className="ar-open-items-secondary-filters">
      <div className="ar-open-items-secondary-filters__group">
        <span className="ar-open-items-secondary-filters__label">Transaction Date</span>
        <div className="ar-open-items-date-chips">
          {dateFilterBuckets.map((bucket) => (
            <button
              key={bucket}
              type="button"
              onClick={() => onDateFilterChange(bucket)}
              className={`ar-open-items-chip ${
                dateFilter === bucket ? 'ar-open-items-chip--active' : ''
              }`}
            >
              {bucket}
            </button>
          ))}
        </div>
      </div>

      <div className="ar-open-items-secondary-filters__divider" />

      <div className="ar-open-items-secondary-filters__group">
        <span className="ar-open-items-secondary-filters__label">{companyLabel}</span>
        <select
          value={companyFilter}
          onChange={(e) => onCompanyFilterChange(e.target.value)}
          className="ar-open-items-company-select"
        >
          <option value="">All {companyPluralLabel}</option>
          {companyOptions.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" onClick={onClear} className="ar-open-items-clear-filters-btn">
          <X size={12} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};

export default AROpenItemsSecondaryFilters;
