"use client";
import React from 'react';
import { ChevronRight, Send, CheckCircle2, PauseCircle } from 'lucide-react';
import type { OpenItemColumn, OpenItemDisplayRow } from '../../types/arOpenItems';

interface AROpenItemsRowProps {
  columns: OpenItemColumn[];
  row: OpenItemDisplayRow;
  gridTemplateColumns: string;
  isExpanded: boolean;
  isPosting: boolean;
  onToggleExpand: (rowId: string) => void;
  onPostToERP: (rowId: string) => void;
}

export const AROpenItemsRow: React.FC<AROpenItemsRowProps> = ({
  columns,
  row,
  gridTemplateColumns,
  isExpanded,
  isPosting,
  onToggleExpand,
  onPostToERP,
}) => {
  const renderAction = () => {
    if (row.status === 'Posted') {
      return (
        <button type="button" disabled className="ar-open-items-action-btn ar-open-items-action-btn--posted">
          <CheckCircle2 size={13} />
          <span>Posted</span>
        </button>
      );
    }

    if (row.status === 'On Hold') {
      return (
        <button
          type="button"
          disabled
          className="ar-open-items-action-btn ar-open-items-action-btn--hold"
          title="Resolve the flagged issue before this context can be posted"
        >
          <PauseCircle size={13} />
          <span>On Hold</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={isPosting}
        onClick={(e) => {
          e.stopPropagation();
          onPostToERP(row.id);
        }}
        className="ar-open-items-action-btn ar-open-items-action-btn--primary"
      >
        <Send size={13} className={isPosting ? 'ar-spin' : ''} />
        <span>{isPosting ? 'Posting...' : 'Post to ERP'}</span>
      </button>
    );
  };

  return (
    <div className={`ar-open-items-row-group ${isExpanded ? 'ar-open-items-row-group--expanded' : ''}`}>
      <div
        className="ar-open-items-row"
        style={{ gridTemplateColumns }}
        onClick={() => onToggleExpand(row.id)}
        role="button"
        tabIndex={0}
      >
        <span className="ar-open-items-row__expand-icon">
          <ChevronRight size={15} />
        </span>

        {columns.map((column, idx) => (
          <span
            key={column.key}
            className="ar-open-items-row__cell"
            style={{ textAlign: column.align === 'right' ? 'right' : 'left' }}
            title={row.cells[idx]}
          >
            {row.cells[idx]}
          </span>
        ))}

        <span className="ar-open-items-row__action" onClick={(e) => e.stopPropagation()}>
          {renderAction()}
        </span>
      </div>

      {isExpanded && (
        <div className="ar-open-items-detail-panel">
          {row.detail.map((field) => (
            <div key={field.label} className="ar-open-items-detail-field">
              <span className="ar-open-items-detail-field__label">{field.label}</span>
              <span className="ar-open-items-detail-field__value">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AROpenItemsRow;
