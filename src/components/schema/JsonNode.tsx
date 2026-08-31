"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, Pencil } from 'lucide-react';

interface JsonNodeProps {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  rootMode?: boolean;
}

export const JsonNode: React.FC<JsonNodeProps> = ({
  label,
  value,
  onChange,
  rootMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editVal, setEditVal] = useState<string>('');

  const isPrimitive = value === null || typeof value !== 'object';
  const isArray = Array.isArray(value);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditVal(String(value ?? ''));
    setIsEditing(true);
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let finalVal: any = editVal.trim();
    if (typeof value === 'boolean') {
      finalVal = editVal.toLowerCase() === 'true';
    } else if (typeof value === 'number') {
      const parsed = Number(editVal);
      if (!isNaN(parsed)) {
        finalVal = parsed;
      }
    }
    onChange(finalVal);
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleObjectChildChange = (key: string, newVal: any) => {
    onChange({
      ...value,
      [key]: newVal
    });
  };

  const handleArrayChildChange = (index: number, newVal: any) => {
    const newArr = [...value];
    newArr[index] = newVal;
    onChange(newArr);
  };

  // 1. Primitive Node View
  if (isPrimitive) {
    if (isEditing) {
      return (
        <div className="json-primitive-edit-inline" onClick={(e) => e.stopPropagation()}>
          <div className="json-primitive-row editing">
            <span className="json-primitive-label">{label}</span>
            <div className="json-primitive-input-wrapper">
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="json-primitive-input"
                autoFocus
              />
              <button onClick={handleSave} className="json-primitive-edit-btn-action save" title="Save">
                <Check size={12} />
              </button>
              <button onClick={handleCancel} className="json-primitive-edit-btn-action cancel" title="Cancel">
                <X size={12} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="json-primitive-row" onClick={handleStartEdit}>
        <span className="json-primitive-label">{label}</span>
        <div className="json-primitive-value-wrapper">
          <span className="json-primitive-value">{String(value ?? 'null')}</span>
          <button
            className="json-primitive-edit-pencil-btn"
            onClick={handleStartEdit}
            title="Edit Property"
            type="button"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Collection Node View (Array / Object)
  const childKeys = isArray ? value.map((_: any, idx: number) => idx) : Object.keys(value);

  if (rootMode) {
    return (
      <div className="json-tree-children-root">
        {childKeys.map((key) => {
          const childVal = isArray ? value[key as number] : value[key as string];
          const handleChange = (newVal: any) => {
            if (isArray) {
              handleArrayChildChange(key as number, newVal);
            } else {
              handleObjectChildChange(key as string, newVal);
            }
          };

          return (
            <JsonNode
              key={String(key)}
              label={String(key)}
              value={childVal}
              onChange={handleChange}
            />
          );
        })}
      </div>
    );
  }

  const itemsCount = isArray ? value.length : Object.keys(value).length;
  const infoLabel = isArray ? `${itemsCount} items` : 'Object';

  return (
    <div className="json-tree-node">
      <div className="json-tree-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="json-tree-chevron">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="json-tree-label">{label}</span>
        <span className="json-tree-info">{infoLabel}</span>
      </div>

      {isExpanded && (
        <div className="json-tree-children">
          {childKeys.map((key) => {
            const childVal = isArray ? value[key as number] : value[key as string];
            const handleChange = (newVal: any) => {
              if (isArray) {
                handleArrayChildChange(key as number, newVal);
              } else {
                handleObjectChildChange(key as string, newVal);
              }
            };

            return (
              <JsonNode
                key={String(key)}
                label={String(key)}
                value={childVal}
                onChange={handleChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JsonNode;

