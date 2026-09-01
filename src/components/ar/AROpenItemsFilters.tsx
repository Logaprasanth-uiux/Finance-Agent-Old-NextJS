"use client";
import React from 'react';
import type { OpenItemSourceType } from '../../types/arOpenItems';
import { openItemsSourceTypes } from '../../data/arOpenItemsMockData';

interface AROpenItemsFiltersProps {
  activeSource: OpenItemSourceType;
  onSelectSource: (source: OpenItemSourceType) => void;
  counts: Record<OpenItemSourceType, number>;
}

export const AROpenItemsFilters: React.FC<AROpenItemsFiltersProps> = ({
  activeSource,
  onSelectSource,
  counts,
}) => {
  return (
    <div className="ar-open-items-filters">
      {openItemsSourceTypes.map((source) => (
        <button
          key={source}
          type="button"
          onClick={() => onSelectSource(source)}
          className={`ar-inbox-pill ar-open-items-filter-pill ${
            activeSource === source ? 'ar-inbox-pill--active' : ''
          }`}
        >
          {source}
          <span className="ar-inbox-pill__badge">{counts[source]}</span>
        </button>
      ))}
    </div>
  );
};

export default AROpenItemsFilters;
