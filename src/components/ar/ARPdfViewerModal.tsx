"use client";
import React, { useEffect } from 'react';
import type { PaymentAttachment } from '../../types/ar';
import { X, FileText, ExternalLink, Download } from 'lucide-react';

interface ARPdfViewerModalProps {
  attachment: PaymentAttachment | null;
  onClose: () => void;
}

export const ARPdfViewerModal: React.FC<ARPdfViewerModalProps> = ({
  attachment,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!attachment) return null;

  return (
    <div className="ar-pdf-modal-backdrop" onClick={onClose}>
      <div
        className="ar-pdf-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`PDF Viewer - ${attachment.name}`}
      >
        {/* Header */}
        <div className="ar-pdf-modal-header">
          <div className="ar-pdf-modal-title-group">
            <div className="ar-pdf-modal-icon-wrap">
              <FileText size={18} className="ar-color-rose" />
            </div>
            <div className="ar-pdf-modal-meta">
              <h3 className="ar-pdf-modal-title" title={attachment.name}>
                {attachment.name}
              </h3>
              <span className="ar-pdf-modal-size">{attachment.size} · PDF Document</span>
            </div>
          </div>

          <div className="ar-pdf-modal-actions">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ar-pdf-modal-btn"
              title="Open in new browser tab"
            >
              <ExternalLink size={16} />
              <span>Open in Tab</span>
            </a>
            <a
              href={attachment.url}
              download={attachment.name}
              className="ar-pdf-modal-btn"
              title="Download PDF"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="ar-pdf-modal-close-btn"
              aria-label="Close document viewer"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content / Viewer */}
        <div className="ar-pdf-modal-body">
          <iframe
            src={attachment.url}
            title={attachment.name}
            className="ar-pdf-frame"
          />
        </div>
      </div>
    </div>
  );
};

export default ARPdfViewerModal;

