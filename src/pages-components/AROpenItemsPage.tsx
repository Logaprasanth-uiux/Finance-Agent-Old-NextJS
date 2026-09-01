"use client";
import React, { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import type { DateFilterBucket, OpenItemDisplayRow, OpenItemSourceType } from '../types/arOpenItems';
import { companyFilterLabels, companyFilterPluralLabels } from '../types/arOpenItems';
import { initialOpenItemsData, openItemsColumns, openItemsSourceTypes } from '../data/arOpenItemsMockData';
import AROpenItemsFilters from '../components/ar/AROpenItemsFilters';
import AROpenItemsSecondaryFilters from '../components/ar/AROpenItemsSecondaryFilters';
import AROpenItemsTable from '../components/ar/AROpenItemsTable';

const isDateInBucket = (isoDate: string, bucket: DateFilterBucket): boolean => {
  if (bucket === 'All Time') return true;

  const txnDate = new Date(`${isoDate}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (bucket === 'Last 7 Days') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return txnDate >= start && txnDate <= startOfToday;
  }

  if (bucket === 'This Month') {
    return txnDate.getFullYear() === now.getFullYear() && txnDate.getMonth() === now.getMonth();
  }

  // Last Month
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return txnDate.getFullYear() === lastMonthRef.getFullYear() && txnDate.getMonth() === lastMonthRef.getMonth();
};

export const AROpenItemsPage: React.FC = () => {
  const [dataBySource, setDataBySource] =
    useState<Record<OpenItemSourceType, OpenItemDisplayRow[]>>(initialOpenItemsData);
  const [activeSource, setActiveSource] = useState<OpenItemSourceType>('Bank');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [postingRowId, setPostingRowId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterBucket>('All Time');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  const counts = useMemo(() => {
    const result = {} as Record<OpenItemSourceType, number>;
    openItemsSourceTypes.forEach((source) => {
      result[source] = dataBySource[source].filter((row) => row.status === 'Ready to Post').length;
    });
    return result;
  }, [dataBySource]);

  const activeColumns = openItemsColumns[activeSource];
  const activeRows = dataBySource[activeSource];
  const companyLabel = companyFilterLabels[activeSource];
  const companyPluralLabel = companyFilterPluralLabels[activeSource];

  const companyOptions = useMemo(() => {
    const unique = Array.from(new Set(activeRows.map((row) => row.company)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [activeRows]);

  const filteredRows = useMemo(() => {
    return activeRows.filter((row) => {
      if (companyFilter && row.company !== companyFilter) return false;
      if (!isDateInBucket(row.txnDate, dateFilter)) return false;
      return true;
    });
  }, [activeRows, companyFilter, dateFilter]);

  const handleSelectSource = (source: OpenItemSourceType) => {
    setActiveSource(source);
    setExpandedRowId(null);
    setDateFilter('All Time');
    setCompanyFilter('');
  };

  const handleClearFilters = () => {
    setDateFilter('All Time');
    setCompanyFilter('');
  };

  const handleToggleExpand = (rowId: string) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const handlePostToERP = (rowId: string) => {
    setPostingRowId(rowId);
    setTimeout(() => {
      setDataBySource((prev) => ({
        ...prev,
        [activeSource]: prev[activeSource].map((row) =>
          row.id === rowId ? { ...row, status: 'Posted' } : row
        ),
      }));
      setPostingRowId(null);
    }, 600);
  };

  return (
    <div className="ar-open-items-page">
      <div className="ar-open-items-header">
        <div className="ar-open-items-header__title-group">
          <span className="ar-open-items-header__icon">
            <Layers size={18} />
          </span>
          <div>
            <h2 className="ar-open-items-header__title">Open Items</h2>
            <p className="ar-open-items-header__subtitle">
              Raw transaction contexts from Bank, On Account, Invoice, 26AS and TDS sources awaiting ERP posting.
            </p>
          </div>
        </div>
        <span className="ar-open-items-header__counter">
          {counts[activeSource]} Ready to Post
        </span>
      </div>

      <AROpenItemsFilters activeSource={activeSource} onSelectSource={handleSelectSource} counts={counts} />

      <AROpenItemsSecondaryFilters
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        companyLabel={companyLabel}
        companyPluralLabel={companyPluralLabel}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        companyOptions={companyOptions}
        onClear={handleClearFilters}
      />

      <AROpenItemsTable
        columns={activeColumns}
        rows={filteredRows}
        expandedRowId={expandedRowId}
        postingRowId={postingRowId}
        onToggleExpand={handleToggleExpand}
        onPostToERP={handlePostToERP}
        emptyMessage={
          activeRows.length > 0
            ? 'No open contexts match the selected filters.'
            : 'No open contexts for this source.'
        }
      />
    </div>
  );
};

export default AROpenItemsPage;
