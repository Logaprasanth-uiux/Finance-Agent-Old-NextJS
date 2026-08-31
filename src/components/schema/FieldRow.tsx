"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface FieldRowProps {
  id: string;
  name: string;
  value: string;
  onEditField: (fieldId: string, name: string, value: string) => void;
}

export const FieldRow: React.FC<FieldRowProps> = ({ id, name, value, onEditField }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(name);
  const [editValue, setEditValue] = useState<string>(value);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any parent container actions
    setEditName(name);
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const trimmedName = editName.trim();
    if (trimmedName) {
      onEditField(id, trimmedName, editValue.trim());
      setIsEditing(false);
    } else {
      handleCancel();
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(false);
    setEditName(name);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-field-row-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-row">
          <div className="editor-input-group name-group">
            <label className="editor-label">Field Name</label>
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Field Name"
              className="editor-input"
            />
          </div>
          
          <div className="editor-input-group value-group">
            <label className="editor-label">Field Value</label>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Field Value"
              className="editor-input"
            />
          </div>
          
          <div className="editor-actions">
            <button onClick={handleSave} className="editor-action-btn save" title="Save Changes">
              <Check size={16} />
            </button>
            <button onClick={handleCancel} className="editor-action-btn cancel" title="Cancel">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schema-field-row interactive">
      <div className="field-info-row">
        <span className="field-name">{name}</span>
        <div className="field-value-wrapper">
          <span className="field-value-display">{value || '—'}</span>
          <button 
            className="field-row-edit-btn" 
            onClick={handleStartEdit}
            title="Edit Field"
            type="button"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldRow;

