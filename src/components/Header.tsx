"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ChevronDown, Store, FileText, RefreshCw, Building2, LogOut, Layers } from 'lucide-react';
import { navigationConfig } from '../config/navigation';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedOrg, email, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current label based on path (including nested submenus)
  let pageTitle = 'Dashboard';
  for (const item of navigationConfig) {
    if (item.path === pathname) {
      pageTitle = item.label;
      break;
    }
    if (item.children) {
      const sub = item.children.find((c) => c.path === pathname);
      if (sub) {
        pageTitle = sub.label;
        break;
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const handleSwitchOrg = () => {
    router.push('/select-organization');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger-btn" aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <h1 className="header-title">{pageTitle}</h1>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <Search size={18} className="search-icon-left" />
          <input 
            type="text" 
            placeholder="What would you like to do today?" 
            className="search-input"
            readOnly
          />
          <ChevronDown size={16} className="search-icon-right" />
        </div>
      </div>
      
      <div className="header-right">
        {/* Active Organization Pill */}
        <button
          type="button"
          onClick={handleSwitchOrg}
          className="header-org-pill"
          title="Click to switch organization workspace"
        >
          <Building2 size={14} className="header-org-icon" />
          <span className="header-org-name">
            {selectedOrg?.name || 'Vendor Management System'}
          </span>
          <ChevronDown size={12} className="header-org-chevron" />
        </button>

        <button className="utility-btn" aria-label="Marketplace">
          <Store size={20} />
        </button>
        <button className="utility-btn" aria-label="Documents">
          <FileText size={20} />
        </button>
        <button className="utility-btn" aria-label="Refresh">
          <RefreshCw size={18} className="spin-hover" />
        </button>

        {/* User Avatar with Context Menu */}
        <div className="header-user-menu" ref={dropdownRef}>
          <div
            className="user-avatar"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <span className="user-initials">
              {email ? email.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="header-user-dropdown">
              <div className="header-user-dropdown__header">
                <div className="header-user-dropdown__name">Alex Morgan</div>
                <div className="header-user-dropdown__email">{email || 'alex.morgan@datatwin.ai'}</div>
                <div className="header-user-dropdown__org">
                  {selectedOrg?.name || 'Vendor Management System'}
                </div>
              </div>

              <div className="header-user-dropdown__menu">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleSwitchOrg();
                  }}
                  className="header-user-dropdown__item"
                >
                  <Layers size={15} />
                  <span>Switch Organization</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="header-user-dropdown__item header-user-dropdown__item--danger"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
