"use client";
import React, { useState, useRef } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import * as XLSX from 'xlsx';
import type { CatalogItem } from '../../types/rfq';
import {
  PackagePlus,
  ArrowRight,
  X,
  Database,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  FileText,
  Layers,
} from 'lucide-react';

export interface ParsedUploadItem {
  id: string;
  name: string;
  model: string;
  category: string;
  quantity: number;
  unit: string;
  specsSummary: string;
  baseSpecs: { id: string; key: string; value: string; source: 'item-master' | 'custom' }[];
  isValid: boolean;
  validationError?: string;
}

interface RFQAddNewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBulkItems?: (items: { item: CatalogItem; quantity: number }[]) => void;
}

const SAMPLE_CSV_CONTENT = `Item Name,Model,Category,Quantity,Unit,Specifications
Dell UltraSharp 32" 4K Monitor,U3223QE,Peripherals / Displays,15,Nos,Panel: IPS Black 4K; Color: 100% sRGB; Ports: USB-C Hub 90W
MacBook Pro 16" M3 Max,MBP-M3-16,Computing / Laptops,10,Nos,Chip: Apple M3 Max; RAM: 36GB; Storage: 1TB SSD
Logitech MX Master 3S Mouse,MX-M3S-GR,Peripherals / Input Devices,25,Nos,Sensor: 8000 DPI Quiet Clicks; Connectivity: Bluetooth + Bolt
Jabra Evolve2 65 Wireless Headset,JBR-EV2-65,Audio / Video Equipment,20,Nos,Mic: 3-Microphone Noise Canceling; Battery: 37 Hours
Cisco Catalyst 24-Port Gigabit Switch,WS-C2960L-24PS,Networking / Infrastructure,4,Nos,Ports: 24x PoE+ GbE; Uplinks: 4x 1G SFP`;

export const RFQAddNewItemModal: React.FC<RFQAddNewItemModalProps> = ({
  isOpen,
  onClose,
  onAddBulkItems,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedUploadItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rfq_bulk_items_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVText = async (text: string, originalFileName: string) => {
    try {
      setIsValidating(true);
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setErrorMessage('The uploaded file appears to be empty or missing data rows.');
        setParsedItems([]);
        return;
      }

      // Helper to parse comma separated with quotes
      const splitCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result.map((s) => s.replace(/^"|"$/g, '').trim());
      };

      const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
      
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('item'));
      const modelIdx = headers.findIndex((h) => h.includes('model') || h.includes('code') || h.includes('sku') || h.includes('part'));
      const catIdx = headers.findIndex((h) => h.includes('cat') || h.includes('group'));
      const qtyIdx = headers.findIndex((h) => h.includes('qty') || h.includes('quantity') || h.includes('count'));
      const unitIdx = headers.findIndex((h) => h.includes('unit') || h.includes('uom'));
      const specsIdx = headers.findIndex((h) => h.includes('spec') || h.includes('desc') || h.includes('detail'));

      const items: ParsedUploadItem[] = [];

      // Fetch DB items for validation
      let dbItems: any[] = [];
      try {
        const res = await fetch(API_ENDPOINTS.items);
        if (res.ok) {
          const data = await res.json();
          dbItems = Array.isArray(data) ? data : (data.Items || []);
        }
      } catch (err) {
        console.error("Failed to fetch Item Master:", err);
      }

      for (let i = 1; i < lines.length; i++) {
        const row = splitCSVLine(lines[i]);
        if (row.length === 0 || row.every((c) => !c)) continue;

        const rawName = nameIdx !== -1 ? row[nameIdx] : (row[0] || '');
        const rawModel = modelIdx !== -1 ? row[modelIdx] : '';
        const rawCat = catIdx !== -1 ? row[catIdx] : '';
        const rawQtyStr = qtyIdx !== -1 ? row[qtyIdx] : '1';
        const rawUnit = unitIdx !== -1 ? row[unitIdx] : 'Nos';
        const rawSpecs = specsIdx !== -1 ? row[specsIdx] : '';

        const qtyNum = parseInt(rawQtyStr.replace(/[^\d]/g, ''), 10);
        const qty = !isNaN(qtyNum) && qtyNum > 0 ? qtyNum : 10;

        let isValid = true;
        let validationError: string | undefined;

        if (!rawName || rawName.trim().length < 2) {
          isValid = false;
          validationError = 'Item Name is required';
        }

        const matchedDbItem = dbItems.find(db => 
          db.itemname && db.itemname.toLowerCase() === rawName.toLowerCase()
        );

        let finalItemId = `up-item-${Date.now()}-${i}`;
        let baseSpecs: { id: string; key: string; value: string; source: 'item-master' | 'custom' }[] = [];

        if (matchedDbItem) {
           finalItemId = matchedDbItem.itemid;
           // Fetch product specs
           try {
              const specRes = await fetch(API_ENDPOINTS.productSpecs(finalItemId));
              if (specRes.ok) {
                 const specData = await specRes.json();
                 const specsArray = Array.isArray(specData) ? specData : (specData.items || []);
                 if (specsArray.length > 0) {
                     baseSpecs = specsArray.map((sp: any, spIdx: number) => ({
                         id: `db-spec-${finalItemId}-${spIdx}`,
                         key: sp.feature || `Spec ${spIdx + 1}`,
                         value: sp.detail_requirement || '',
                         source: 'item-master'
                     }));
                 }
              }
           } catch (e) {
              console.error("Failed to fetch specs for", finalItemId, e);
           }

        } else if (isValid) {
           isValid = false;
           validationError = "Item not present in Item Master. Please create this item first.";
           // Continue processing to show preview anyway
           if (rawSpecs) {
             const specPairs = rawSpecs.split(/;|\|/).map((s) => s.trim()).filter(Boolean);
             specPairs.forEach((pair, sIdx) => {
               if (pair.includes(':')) {
                 const [k, v] = pair.split(':');
                 baseSpecs.push({ id: `spec-up-${i}-${sIdx}`, key: k.trim(), value: v.trim(), source: 'item-master' });
               } else {
                 baseSpecs.push({ id: `spec-up-${i}-${sIdx}`, key: `Spec ${sIdx + 1}`, value: pair.trim(), source: 'item-master' });
               }
             });
           }
        }

        items.push({
          id: finalItemId,
          name: matchedDbItem ? matchedDbItem.itemname : (rawName || `Unnamed Item (Row ${i})`),
          model: matchedDbItem ? (matchedDbItem.linkref1 || rawModel) : (rawModel || ''),
          category: matchedDbItem ? (matchedDbItem.itemgroup || rawCat) : (rawCat || 'Uncategorized'),
          quantity: qty,
          unit: matchedDbItem ? (matchedDbItem.unit || rawUnit) : (rawUnit || 'Nos'),
          specsSummary: baseSpecs.map((s) => `${s.key}: ${s.value}`).join(' · '),
          baseSpecs,
          isValid,
          validationError,
        });
      }

      setParsedItems(items);
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to parse file. Please ensure it is a valid CSV or Excel text document.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      setErrorMessage('Unsupported file format. Please upload a .CSV or .XLSX file.');
      setParsedItems([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      
      if (isCSV) {
        if (typeof content === 'string') {
          await parseCSVText(content, file.name);
        }
      } else {
        // XLSX Handling
        if (content && typeof content !== 'string') {
          try {
            setIsValidating(true);
            const data = new Uint8Array(content as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            await parseCSVText(csvContent, file.name);
          } catch (err) {
            console.error("Failed to parse XLSX:", err);
            setErrorMessage('Failed to parse Excel file. It might be corrupted or unsupported.');
            setParsedItems([]);
          } finally {
            setIsValidating(false);
          }
        }
      }
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      // For XLSX, read as ArrayBuffer for proper binary parsing
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    setFileSize(null);
    setParsedItems([]);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validItems = parsedItems.filter((item) => item.isValid);
  const invalidItems = parsedItems.filter((item) => !item.isValid);

  const handleConfirmAddItems = () => {
    if (!onAddBulkItems || validItems.length === 0) return;

    const catalogItemsToAdd = validItems.map((p) => {
      const catItem: CatalogItem = {
        id: p.id,
        name: p.name,
        model: p.model,
        category: p.category,
        unit: p.unit,
        defaultQuantity: p.quantity,
        baseSpecs: p.baseSpecs,
        aiSuggestions: [
          {
            id: `ai-sug-${p.id}-1`,
            key: 'Standard Warranty SLA',
            value: '3 Years Comprehensive NBD Support',
            source: 'ai-suggested',
            category: 'Service & Support',
            rationale: 'Standardizes warranty SLA for enterprise procurement.',
            isAccepted: true,
          },
        ],
        badge: 'Bulk Uploaded',
      };
      return {
        item: catItem,
        quantity: p.quantity,
      };
    });

    onAddBulkItems(catalogItemsToAdd);
    onClose();
    handleClearFile();
  };

  return (
    <div className="rfq-modal-backdrop" onClick={onClose}>
      <div
        className="rfq-modal-card rfq-modal-card--upload"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rfq-modal-header">
          <div className="rfq-modal-header-icon rfq-modal-header-icon--blue">
            <PackagePlus size={20} />
          </div>
          <div className="rfq-modal-header-text">
            <h3 className="rfq-modal-title">Add Items to RFQ</h3>
            <p className="rfq-modal-sub">Bulk File Import &amp; Item Master Catalog</p>
          </div>
          <button
            className="rfq-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="rfq-modal-tabs">
          <button
            type="button"
            className={`rfq-modal-tab ${activeTab === 'upload' ? 'rfq-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FileSpreadsheet size={15} />
            <span>Upload Item File (CSV / Excel)</span>
          </button>
          <button
            type="button"
            className={`rfq-modal-tab ${activeTab === 'manual' ? 'rfq-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Database size={15} />
            <span>Manual Registration (Item Master)</span>
          </button>
        </div>

        <div className="rfq-modal-body rfq-modal-body--scrollable">
          {activeTab === 'upload' ? (
            <div className="rfq-upload-experience">
              {/* Drag & Drop Upload Zone */}
              {!fileName ? (
                <div
                  className={`rfq-upload-dropzone ${isDragging ? 'rfq-upload-dropzone--active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,text/csv"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />

                  <div className="rfq-upload-dropzone__icon">
                    <Upload size={28} />
                  </div>
                  <h4 className="rfq-upload-dropzone__title">
                    Upload Item File
                  </h4>
                  <p className="rfq-upload-dropzone__prompt">
                    Drag &amp; drop your item file here, or{' '}
                    <span className="rfq-upload-browse-link">Browse Files</span>
                  </p>
                  <span className="rfq-upload-dropzone__formats">
                    Supported formats: <strong>CSV, XLSX</strong>
                  </span>
                </div>
              ) : (
                /* Selected File Card */
                <div className="rfq-upload-selected-file">
                  <div className="rfq-upload-selected-file__left">
                    <div className="rfq-upload-file-icon">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h4 className="rfq-upload-file-name">{fileName}</h4>
                      <span className="rfq-upload-file-meta">
                        {fileSize} · {parsedItems.length} Total Rows Detected
                      </span>
                    </div>
                  </div>

                  <div className="rfq-upload-selected-file__right">
                    {isValidating && (
                       <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1rem' }}>
                         <div style={{ width: '14px', height: '14px', border: '2px solid #64748b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                         Validating...
                       </span>
                    )}
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="rfq-btn rfq-btn--xs rfq-btn--outline rfq-upload-clear-btn"
                      disabled={isValidating}
                    >
                      <Trash2 size={13} />
                      <span>Remove / Re-upload</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Template download helper */}
              {!fileName && (
                <div className="rfq-upload-helper-bar">
                  <div className="rfq-upload-helper-text">
                    <FileText size={14} className="rfq-icon-indigo" />
                    <span>Need the standard item columns format?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="rfq-btn rfq-btn--xs rfq-btn--outline"
                  >
                    <Download size={13} />
                    <span>Download Sample CSV Template</span>
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="rfq-upload-error-banner">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Parsed Items Preview Table */}
              {parsedItems.length > 0 && (
                <div className="rfq-upload-preview-section">
                  <div className="rfq-upload-preview-header">
                    <div className="rfq-upload-preview-title-wrap">
                      <Layers size={16} className="rfq-icon-indigo" />
                      <h4 className="rfq-upload-preview-title">
                        Detected Items Preview ({validItems.length} Valid)
                      </h4>
                    </div>

                    <div className="rfq-upload-preview-badges">
                      <span className="rfq-upload-badge rfq-upload-badge--valid">
                        <CheckCircle2 size={12} />
                        {validItems.length} Ready to Add
                      </span>
                      {invalidItems.length > 0 && (
                        <span className="rfq-upload-badge rfq-upload-badge--invalid">
                          <AlertCircle size={12} />
                          {invalidItems.length} Invalid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rfq-upload-table-wrap">
                    <table className="rfq-upload-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Quantity</th>
                          <th>Specifications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={!item.isValid ? 'rfq-upload-row--invalid' : ''}
                          >
                            <td>
                              {item.isValid ? (
                                <span className="rfq-status-chip rfq-status-chip--valid">
                                  Valid
                                </span>
                              ) : (
                                <span
                                  className="rfq-status-chip rfq-status-chip--invalid"
                                  title={item.validationError}
                                >
                                  Error
                                </span>
                              )}
                            </td>
                            <td>
                              <strong>{item.name}</strong>
                              {item.validationError && (
                                <span className="rfq-upload-row-error">
                                  {item.validationError}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="rfq-cat-tag">{item.category}</span>
                            </td>
                            <td>
                              <strong>
                                {item.quantity} {item.unit}
                              </strong>
                            </td>
                            <td className="rfq-upload-specs-cell">
                              <span>{item.specsSummary}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Item Master Pathway Tab */
            <div className="rfq-manual-experience">
              <div className="rfq-modal-info-box">
                <Database size={18} className="rfq-modal-info-box__icon" />
                <div>
                  <p className="rfq-modal-info-box__title">
                    Item Master Governance Required
                  </p>
                  <p className="rfq-modal-info-box__desc">
                    To ensure inventory traceability, tax classification (HSN/SAC), and centralized specification management, new catalog items must be registered through the <strong>Item Master</strong> catalog.
                  </p>
                </div>
              </div>

              <div className="rfq-pathway-steps">
                <div className="rfq-pathway-step">
                  <span className="rfq-pathway-num">1</span>
                  <span>Submit item registration with base specifications in Item Master.</span>
                </div>
                <div className="rfq-pathway-step">
                  <span className="rfq-pathway-num">2</span>
                  <span>Procurement admin approves the item code and classification.</span>
                </div>
                <div className="rfq-pathway-step">
                  <span className="rfq-pathway-num">3</span>
                  <span>The item instantly becomes selectable for all future RFQs and POs.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rfq-modal-footer">
          <button
            type="button"
            className="rfq-btn rfq-btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          {activeTab === 'upload' ? (
            <button
              type="button"
              className="rfq-btn rfq-btn--primary"
              disabled={validItems.length === 0}
              onClick={handleConfirmAddItems}
            >
              <PackagePlus size={15} />
              <span>
                {validItems.length > 0
                  ? `Add ${validItems.length} Item${validItems.length > 1 ? 's' : ''} to RFQ`
                  : 'Add Items'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="rfq-btn rfq-btn--primary"
              onClick={() => {
                onClose();
              }}
            >
              <span>Go to Item Master</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQAddNewItemModal;


