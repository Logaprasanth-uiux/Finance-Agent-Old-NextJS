"use client";
import React from 'react';
import { Inbox as InboxIcon } from 'lucide-react';
import type { OpenItemColumn, OpenItemDisplayRow } from '../../types/arOpenItems';
import AROpenItemsRow from './AROpenItemsRow';

interface AROpenItemsTableProps {
  columns: OpenItemColumn[];
  rows: OpenItemDisplayRow[];
  expandedRowId: string | null;
  postingRowId: string | null;
  onToggleExpand: (rowId: string) => void;
  onPostToERP: (rowId: string) => void;
  emptyMessage?: string;
}

export const AROpenItemsTable: React.FC<AROpenItemsTableProps> = ({
  columns,
  rows,
  expandedRowId,
  postingRowId,
  onToggleExpand,
  onPostToERP,
  emptyMessage = 'No open contexts for this source.',
}) => {
  const gridTemplateColumns = `28px ${columns
    .map((c) => (c.align === 'right' ? 'minmax(110px, 0.9fr)' : 'minmax(130px, 1.2fr)'))
    .join(' ')} 130px`;

  if (rows.length === 0) {
    return (
      <div className="ar-open-items-table">
        <div className="ar-open-items-empty">
          <InboxIcon size={24} />
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-open-items-table">
      <div className="ar-open-items-table__head" style={{ gridTemplateColumns }}>
        <span />
        {columns.map((column) => (
          <span
            key={column.key}
            className="ar-open-items-table__head-cell"
            style={{ textAlign: column.align === 'right' ? 'right' : 'left' }}
          >
            {column.label}
          </span>
        ))}
        <span className="ar-open-items-table__head-cell" style={{ textAlign: 'left' }}>
          Action
        </span>
      </div>

      <div className="ar-open-items-table__body">
        {rows.map((row) => (
          <AROpenItemsRow
            key={row.id}
            columns={columns}
            row={row}
            gridTemplateColumns={gridTemplateColumns}
            isExpanded={expandedRowId === row.id}
            isPosting={postingRowId === row.id}
            onToggleExpand={onToggleExpand}
            onPostToERP={onPostToERP}
          />
        ))}
      </div>
    </div>
  );
};

export default AROpenItemsTable;
