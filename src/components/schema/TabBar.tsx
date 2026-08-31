"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X, ChevronLeft, ChevronRight, Pencil, Menu } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  onAddTab: (name: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
  tabContainers: Record<string, any[]>;
}

interface SchemaNavigatorProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  tabContainers: Record<string, any[]>;
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaNavigator: React.FC<SchemaNavigatorProps> = ({
  tabs,
  activeTabId,
  setActiveTabId,
  tabContainers,
  isOpen,
  onClose
}) => {
  const activeDropdownItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && activeDropdownItemRef.current) {
      activeDropdownItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' as any });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="schema-dropdown-backdrop" onClick={onClose} />
      <div className="schema-tab-dropdown-menu">
        <div className="schema-navigator-list">
          {tabs.map((tab) => {
            const count = tabContainers[tab.id]?.length || 0;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeDropdownItemRef : null}
                onClick={() => {
                  setActiveTabId(tab.id);
                  onClose();
                }}
                className={`schema-dropdown-item ${isActive ? 'active' : ''}`}
              >
                <span className="dropdown-tab-name">{tab.name}</span>
                <span className="dropdown-tab-count">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const TabBar: React.FC<TabBarProps> = ({ 
  tabs, 
  activeTabId, 
  setActiveTabId, 
  onAddTab,
  onRenameTab,
  tabContainers
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTabName, setNewTabName] = useState<string>('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const tabEditInputRef = useRef<HTMLInputElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs, isAdding, editingTabId]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingTabId && tabEditInputRef.current) {
      tabEditInputRef.current.focus();
      tabEditInputRef.current.select();
    }
  }, [editingTabId]);

  useEffect(() => {
    if (tabsListRef.current) {
      const activeEl = tabsListRef.current.querySelector('.schema-tab.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
    const timer = setTimeout(checkScroll, 300);
    return () => clearTimeout(timer);
  }, [activeTabId, tabs]);

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewTabName('');
    setTimeout(() => {
      if (tabsListRef.current) {
        tabsListRef.current.scrollLeft = tabsListRef.current.scrollWidth;
      }
    }, 50);
  };

  const handleSave = () => {
    const trimmedName = newTabName.trim();
    if (trimmedName) {
      onAddTab(trimmedName);
      setIsAdding(false);
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewTabName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStartRename = (e: React.MouseEvent, tabId: string, currentName: string) => {
    e.stopPropagation(); // Avoid activating/selecting the tab when clicking edit
    setEditingTabId(tabId);
    setEditTabName(currentName);
  };

  const handleSaveRename = (tabId: string) => {
    const trimmed = editTabName.trim();
    if (trimmed) {
      onRenameTab(tabId, trimmed);
    }
    setEditingTabId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tabId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  const scrollLeftAction = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const scrollRightAction = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  return (
    <div className="schema-tabs-container">
      {/* Dropdown Tab Navigator */}
      <div className="schema-tab-dropdown-wrapper">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`schema-tab-dropdown-btn ${isDropdownOpen ? 'active' : ''}`}
          type="button"
          title="Quick Navigation Panel"
          aria-label="Tab Navigator"
        >
          <Menu size={16} />
        </button>
        
        <SchemaNavigator
          tabs={tabs}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          tabContainers={tabContainers}
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
        />
      </div>

      <div className="schema-tabs-navigation">
        <button 
          onClick={scrollLeftAction} 
          className={`schema-scroll-btn ${canScrollLeft ? 'visible' : ''}`}
          disabled={!canScrollLeft}
          type="button"
          aria-label="Scroll Tabs Left"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="schema-tabs-list" ref={tabsListRef} onScroll={checkScroll}>
          {tabs.map((tab) => {
            const isEditingThisTab = editingTabId === tab.id;
            const isActive = activeTabId === tab.id;

            if (isEditingThisTab) {
              return (
                <div key={tab.id} className="schema-tab-edit-inline" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={tabEditInputRef}
                    type="text"
                    value={editTabName}
                    onChange={(e) => setEditTabName(e.target.value)}
                    onKeyDown={(e) => handleRenameKeyDown(e, tab.id)}
                    className="schema-tab-input-inline"
                    maxLength={25}
                  />
                  <button onClick={() => handleSaveRename(tab.id)} className="schema-tab-edit-btn save" title="Save">
                    <Check size={12} />
                  </button>
                  <button onClick={() => setEditingTabId(null)} className="schema-tab-edit-btn cancel" title="Cancel">
                    <X size={12} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`schema-tab ${isActive ? 'active' : ''}`}
                title={tab.name}
              >
                <span className="tab-label-text">{tab.name}</span>
                <span 
                  className="tab-edit-pencil-btn" 
                  onClick={(e) => handleStartRename(e, tab.id, tab.name)}
                  title="Rename Tab"
                >
                  <Pencil size={13} />
                </span>
              </button>
            );
          })}
          
          {/* Inline Add Tab Editor */}
          {isAdding && (
            <div className="schema-tab-edit-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New Tab"
                className="schema-tab-input"
                maxLength={20}
              />
              <button onClick={handleSave} className="schema-tab-btn-action save" title="Save Tab">
                <Check size={14} />
              </button>
              <button onClick={handleCancel} className="schema-tab-btn-action cancel" title="Cancel">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={scrollRightAction} 
          className={`schema-scroll-btn ${canScrollRight ? 'visible' : ''}`}
          disabled={!canScrollRight}
          type="button"
          aria-label="Scroll Tabs Right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="schema-tabs-actions">
        <button 
          onClick={handleStartAdd} 
          className="schema-add-tab-btn"
          disabled={isAdding}
        >
          <Plus size={16} />
          <span>Add Tab</span>
        </button>
      </div>
    </div>
  );
};

export default TabBar;

