"use client";
import React from 'react';
import type { LinkedRecord } from '../../types/ar';
import { formatCurrencyINR } from '../../data/arMockData';
import {
  FileText,
  Landmark,
  FileCheck2,
  Receipt,
  BookOpen,
  Link2,
  CheckCircle,
} from 'lucide-react';

interface ARLinkedRecordsProps {
  records: LinkedRecord[];
}

export const ARLinkedRecords: React.FC<ARLinkedRecordsProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="ar-linked-records-empty">
        <Link2 size={16} />
        <span>No linked records mapped to this invoice.</span>
      </div>
    );
  }

  const getRecordIcon = (type: LinkedRecord['type']) => {
    switch (type) {
      case 'Purchase Order':
        return <FileText size={15} className="ar-linked-record__type-icon ar-icon-blue" />;
      case 'Bank Statement Line':
        return <Landmark size={15} className="ar-linked-record__type-icon ar-icon-emerald" />;
      case 'TDS Certificate':
        return <Receipt size={15} className="ar-linked-record__type-icon ar-icon-purple" />;
      case 'SAP Clearing Doc':
        return <FileCheck2 size={15} className="ar-linked-record__type-icon ar-icon-indigo" />;
      case 'Customer Ledger':
        return <BookOpen size={15} className="ar-linked-record__type-icon ar-icon-amber" />;
      default:
        return <Link2 size={15} className="ar-linked-record__type-icon" />;
    }
  };

  return (
    <div className="ar-linked-records-container">
      <div className="ar-linked-records-header">
        <div className="ar-linked-records-title-group">
          <Link2 size={14} className="ar-linked-records-main-icon" />
          <h5 className="ar-linked-records-title">Linked / Mapped Records</h5>
        </div>
        <span className="ar-linked-records-count">{records.length} Records Mapped</span>
      </div>

      <div className="ar-linked-records-grid">
        {records.map((record) => (
          <div key={record.id} className="ar-linked-record-card">
            <div className="ar-linked-record-card__header">
              <div className="ar-linked-record-card__type">
                {getRecordIcon(record.type)}
                <span className="ar-linked-record-card__type-text">{record.type}</span>
              </div>
              <span className="ar-linked-record-card__status">
                <CheckCircle size={11} />
                {record.status}
              </span>
            </div>

            <div className="ar-linked-record-card__ref-row">
              <code className="ar-linked-record-card__ref">{record.reference}</code>
              {record.amount !== undefined && (
                <span className="ar-linked-record-card__amount">
                  {formatCurrencyINR(record.amount)}
                </span>
              )}
            </div>

            {record.details && (
              <div className="ar-linked-record-card__details">
                {record.details}
              </div>
            )}

            <div className="ar-linked-record-card__footer">
              <span className="ar-linked-record-card__date">Date: {record.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ARLinkedRecords;

