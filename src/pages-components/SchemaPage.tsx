"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import FilterSection from '../components/schema/FilterSection';
import TabBar from '../components/schema/TabBar';
import ContainerCard from '../components/schema/ContainerCard';
import { schemaService } from '../services/schemaService';
import type { Tab, Container } from '../services/schemaService';

export const SchemaPage: React.FC = () => {
  // Load workspace tabs dynamically using the Schema Service API (each section represents a Tab)
  const [tabs, setTabs] = useState<Tab[]>(() => schemaService.getWorkspaceTabs());
  
  // Set default active tab dynamically
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const initialTabs = schemaService.getWorkspaceTabs();
    return initialTabs.length > 0 ? initialTabs[0].id : '';
  });

  // Load container configurations dynamically for each tab using the Schema Service API
  // In standard tabs, each container card represents a specific metadata Field
  const [tabContainers, setTabContainers] = useState<Record<string, Container[]>>(() => {
    const initialTabs = schemaService.getWorkspaceTabs();
    const initialMap: Record<string, Container[]> = {};
    initialTabs.forEach(t => {
      initialMap[t.id] = schemaService.getContainers(t.id);
    });
    return initialMap;
  });

  const [isAddingContainer, setIsAddingContainer] = useState<boolean>(false);
  const [newContainerTitle, setNewContainerTitle] = useState<string>('');
  const containerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingContainer && containerInputRef.current) {
      containerInputRef.current.focus();
    }
  }, [isAddingContainer]);

  const handleAddTab = (name: string) => {
    const newTabId = name.trim(); // Use the name directly as standard tab IDs represent Sections
    const newTab = { id: newTabId, name };
    setTabs([...tabs, newTab]);
    setTabContainers(prev => ({
      ...prev,
      [newTabId]: []
    }));
    setActiveTabId(newTabId);
  };

  const handleRenameTab = (tabId: string, newName: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: newName, id: newName } : t));
    setTabContainers(prev => {
      const dataCopy = { ...prev };
      if (dataCopy[tabId]) {
        dataCopy[newName] = dataCopy[tabId];
        delete dataCopy[tabId];
      }
      return dataCopy;
    });
    setActiveTabId(newName);
  };

  const handleToggleCollapse = (containerId: string) => {
    setTabContainers(prev => {
      const activeContainers = prev[activeTabId] || [];
      const updated = activeContainers.map(c => 
        c.id === containerId ? { ...c, isCollapsed: !c.isCollapsed } : c
      );
      return {
        ...prev,
        [activeTabId]: updated
      };
    });
  };

  // Add sub-properties inline inside the field's data model keys list
  const handleAddSubProperty = (containerId: string, name: string, type: string, value: string) => {
    setTabContainers(prev => {
      const activeContainers = prev[activeTabId] || [];
      const updated = activeContainers.map(c => {
        if (c.id === containerId) {
          const updatedData = { ...c.data };
          let finalVal: any = value;
          if (type === 'Checkbox') {
            finalVal = value.toLowerCase() === 'true';
          }
          updatedData[name] = finalVal;
          return { ...c, data: updatedData };
        }
        return c;
      });
      return {
        ...prev,
        [activeTabId]: updated
      };
    });
  };

  // Generic callback handling edits occurring at any node level in the JSON outline tree
  const handleUpdateContainerData = (containerId: string, updatedData: any) => {
    setTabContainers(prev => {
      const activeContainers = prev[activeTabId] || [];
      const updated = activeContainers.map(c => {
        if (c.id === containerId) {
          // Synchronize card title dynamically if FieldName (standard tab) or Type (schema tab) is renamed inside tree
          const newTitle = activeTabId === 'schema-tab' 
            ? (updatedData.Type || c.title) 
            : (updatedData.FieldName || c.title);
          
          return { 
            ...c, 
            data: updatedData, 
            title: newTitle 
          };
        }
        return c;
      });
      return {
        ...prev,
        [activeTabId]: updated
      };
    });
  };

  // Renaming headers directly: syncs bidirectional keys back to FieldName or Type
  const handleRenameContainer = (containerId: string, newTitle: string) => {
    setTabContainers(prev => {
      const activeContainers = prev[activeTabId] || [];
      const updated = activeContainers.map(c => {
        if (c.id === containerId) {
          const updatedData = { ...c.data };
          if (activeTabId === 'schema-tab') {
            updatedData.Type = newTitle;
          } else {
            updatedData.FieldName = newTitle;
          }
          return { 
            ...c, 
            title: newTitle, 
            data: updatedData 
          };
        }
        return c;
      });
      return {
        ...prev,
        [activeTabId]: updated
      };
    });
  };

  const handleStartAddContainer = () => {
    setIsAddingContainer(true);
    setNewContainerTitle('');
  };

  // Saves a new collapsible container (a Field object in standard tabs, or a config object in Schema tab)
  const handleSaveContainer = () => {
    const trimmedTitle = newContainerTitle.trim();
    if (trimmedTitle) {
      const isSchema = activeTabId === 'schema-tab';
      const containerId = Date.now().toString();
      
      const newContainer: Container = {
        id: containerId,
        title: trimmedTitle,
        isCollapsed: false, // Expands automatically
        data: isSchema ? {
          Type: trimmedTitle,
          ScreenName: 'Bill Extraction',
          moduleName: 'DTFOWS'
        } : {
          FieldName: trimmedTitle,
          FieldType: 'input',
          FieldEditable: 'true',
          FieldID: Date.now()
        }
      };
      
      setTabContainers(prev => {
        const activeContainers = prev[activeTabId] || [];
        return {
          ...prev,
          [activeTabId]: [...activeContainers, newContainer]
        };
      });
      setIsAddingContainer(false);
    } else {
      handleCancelContainer();
    }
  };

  const handleCancelContainer = () => {
    setIsAddingContainer(false);
    setNewContainerTitle('');
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveContainer();
    } else if (e.key === 'Escape') {
      handleCancelContainer();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTabContainers((prev) => {
        const containers = prev[activeTabId] || [];
        const oldIndex = containers.findIndex((c) => c.id === active.id);
        const newIndex = containers.findIndex((c) => c.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const updated = arrayMove(containers, oldIndex, newIndex);
          return {
            ...prev,
            [activeTabId]: updated
          };
        }
        return prev;
      });
    }
  };

  const currentContainers = tabContainers[activeTabId] || [];
  const isSchema = activeTabId === 'schema-tab';

  return (
    <div className="schema-page">
      {/* Filter Section */}
      <FilterSection />

      {/* Tab Bar Strip */}
      <TabBar 
        tabs={tabs} 
        activeTabId={activeTabId} 
        setActiveTabId={setActiveTabId} 
        onAddTab={handleAddTab}
        onRenameTab={handleRenameTab}
        tabContainers={tabContainers}
      />

      {/* Container List Workspace */}
      <div className="schema-workspace-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentContainers.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="schema-containers-list">
              {currentContainers.map((container) => (
                <ContainerCard
                  key={container.id}
                  id={container.id}
                  title={container.title}
                  isCollapsed={container.isCollapsed}
                  data={container.data}
                  isSchemaTab={isSchema}
                  onToggleCollapse={handleToggleCollapse}
                  onRenameContainer={handleRenameContainer}
                  onUpdateContainerData={handleUpdateContainerData}
                  onAddField={handleAddSubProperty}
                />
              ))}

              {currentContainers.length === 0 && !isAddingContainer && (
                <div className="empty-containers-message">
                  {isSchema 
                    ? 'No containers inside this tab. Click "+ Add Container" to create one.' 
                    : 'No fields inside this tab. Click "+ Add Field" to create one.'
                  }
                </div>
              )}

              {/* Inline Add Container Form */}
              {isAddingContainer ? (
                <div className="inline-container-editor">
                  <label className="editor-label">
                    {isSchema ? 'Container Name' : 'Field Name'}
                  </label>
                  <div className="inline-container-row">
                    <input
                      ref={containerInputRef}
                      type="text"
                      value={newContainerTitle}
                      onChange={(e) => setNewContainerTitle(e.target.value)}
                      onKeyDown={handleContainerKeyDown}
                      placeholder={isSchema ? 'Enter Container Title...' : 'Enter Field Name...'}
                      className="container-editor-input"
                    />
                    <button onClick={handleSaveContainer} className="editor-action-btn save" title="Save">
                      <Check size={16} />
                    </button>
                    <button onClick={handleCancelContainer} className="editor-action-btn cancel" title="Cancel">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleStartAddContainer} 
                  className="schema-add-container-btn"
                  type="button"
                >
                  <Plus size={16} />
                  <span>{isSchema ? 'Add Container' : 'Add Field'}</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default SchemaPage;

