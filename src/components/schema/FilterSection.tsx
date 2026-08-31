"use client";
import React from 'react';
import { Search } from 'lucide-react';

export const FilterSection: React.FC = () => {
  return (
    <div className="schema-filters-card">
      <div className="schema-filters-row">
        <div className="filter-group">
          <label className="filter-label">Tenant ID</label>
          <input 
            type="text" 
            placeholder="Enter Tenant ID..." 
            className="filter-input" 
            readOnly 
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Organization Name</label>
          <input 
            type="text" 
            placeholder="Enter Organization..." 
            className="filter-input" 
            readOnly 
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Screen Name</label>
          <input 
            type="text" 
            placeholder="Enter Screen Name..." 
            className="filter-input" 
            readOnly 
          />
        </div>
        <div className="filter-group action-group">
          <label className="filter-label" style={{ visibility: 'hidden' }}>Search</label>
          <button className="filter-search-btn" type="button">
            <Search size={16} />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;

