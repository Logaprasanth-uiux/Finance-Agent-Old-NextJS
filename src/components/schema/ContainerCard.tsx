"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Check, X, Pencil, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import JsonNode from './JsonNode';

interface ContainerCardProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  data: any;
  isSchemaTab: boolean;
  onToggleCollapse: (id: string) => void;
  onRenameContainer: (id: string, newTitle: string) => void;
  onUpdateContainerData: (id: string, updatedData: any) => void;
  onAddField: (containerId: string, name: string, type: string, value: string) => void;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({
  id,
  title,
  isCollapsed,
  data,
  isSchemaTab,
  onToggleCollapse,
  onRenameContainer,
  onUpdateContainerData,
  onAddField,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [fieldName, setFieldName] = useState<string>('');
  const [fieldType, setFieldType] = useState<string>('Input');
  const [fieldValue, setFieldValue] = useState<string>('');
  const fieldInputRef = useRef<HTMLInputElement>(null);

  // States for container title inline editing
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && fieldInputRef.current) {
      fieldInputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleStartAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setFieldName('');
    setFieldType('Input');
    setFieldValue('');
  };

  const handleSave = () => {
    const trimmedName = fieldName.trim();
    const trimmedValue = fieldValue.trim();
    if (trimmedName) {
      onAddField(id, trimmedName, fieldType, trimmedValue);
      setIsAdding(false);
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFieldName('');
    setFieldValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStartRenameTitle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the collapse state of the container card
    setIsEditingTitle(true);
    setEditTitle(title);
  };

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameContainer(id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handlePropChange = (key: string, newVal: any) => {
    onUpdateContainerData(id, {
      ...data,
      [key]: newVal
    });
  };

  // Determine which properties of data to display
  // We filter out FieldName in standard tabs to avoid duplication in the expanded list per refinement 5
  const displayKeys = Object.keys(data || {}).filter(key => isSchemaTab ? true : key !== 'FieldName');
  const propertiesCount = displayKeys.length;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`container-card ${isCollapsed ? 'collapsed' : 'expanded'} ${isDragging ? 'dragging' : ''}`}
    >
      {/* Header */}
      <div className="container-header" onClick={() => onToggleCollapse(id)}>
        <div className="header-left-side">
          {/* Drag Handle */}
          <div 
            className="drag-handle" 
            {...attributes} 
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </div>
          
          <span className="collapse-icon">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </span>
          {isEditingTitle ? (
            <div className="container-title-edit-wrapper" onClick={(e) => e.stopPropagation()}>
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="container-title-input"
                maxLength={45}
              />
              <button onClick={handleSaveTitle} className="container-title-btn save" title="Save Title">
                <Check size={12} />
              </button>
              <button onClick={() => setIsEditingTitle(false)} className="container-title-btn cancel" title="Cancel">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="container-title-wrapper">
              <h3 className="container-title">{title}</h3>
              <button
                className="container-edit-pencil-btn"
                onClick={handleStartRenameTitle}
                title="Rename"
                type="button"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>
        
        <div className="header-right-side">
          <span className="field-count">
            {isSchemaTab ? `${propertiesCount} Properties` : `${propertiesCount} ${propertiesCount === 1 ? 'Property' : 'Properties'}`}
          </span>
          {/* Add Sub-Property button inside expanded standard cards */}
          {!isCollapsed && !isAdding && !isSchemaTab && (
            <button 
              onClick={handleStartAdd} 
              className="container-add-field-btn"
              type="button"
            >
              <Plus size={14} />
              <span>Add Sub-Property</span>
            </button>
          )}
        </div>
      </div>

      {/* Body content */}
      {!isCollapsed && (
        <div className="container-body">
          <div className="fields-list">
            {isSchemaTab ? (
              // 1. Schema Config Tab: render properties of the config object directly
              data ? (
                <JsonNode 
                  label="" 
                  value={data} 
                  onChange={(updated) => onUpdateContainerData(id, updated)} 
                  rootMode={true} 
                />
              ) : (
                <div className="empty-fields-message">No schema properties configured.</div>
              )
            ) : (
              // 2. Standard Tab: render each field property recursively
              <>
                {displayKeys.map(key => (
                  <JsonNode 
                    key={key} 
                    label={key} 
                    value={data[key]}
                    onChange={(newVal) => handlePropChange(key, newVal)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Inline Add Sub-Property Form */}
          {isAdding && !isSchemaTab && (
            <div className="inline-field-editor">
              <div className="editor-row">
                <div className="editor-input-group name-group">
                  <label className="editor-label">Property Name</label>
                  <input
                    ref={fieldInputRef}
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Property Name..."
                    className="editor-input"
                  />
                </div>

                <div className="editor-input-group value-group">
                  <label className="editor-label">Value</label>
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Value..."
                    className="editor-input"
                  />
                </div>
                
                <div className="editor-input-group type-group">
                  <label className="editor-label">Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="editor-select"
                  >
                    <option value="Input">Text</option>
                    <option value="Checkbox">Boolean</option>
                  </select>
                </div>
                
                <div className="editor-actions">
                  <button onClick={handleSave} className="editor-action-btn save" title="Save Property">
                    <Check size={16} />
                  </button>
                  <button onClick={handleCancel} className="editor-action-btn cancel" title="Cancel">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContainerCard;

