"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { navigationConfig } from '../config/navigation';

export const Sidebar = () => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    '/transact': true, // Default open for Transact so RFQ and sub-items are visible
    '/ar': true, // Default open for AR so Inbox and Open Items are visible
  });

  const toggleSubmenu = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubmenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-agentic">Agentic</span>
        <span className="brand-finance">Finance</span>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {navigationConfig.map((item) => {
            const IconComponent = (Icons as any)[item.iconName] || Icons.HelpCircle;
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isSubmenuOpen = Boolean(openSubmenus[item.path]);
            const isParentActive =
              pathname === item.path ||
              (hasChildren && pathname.startsWith(item.path));

            return (
              <li key={item.path} className="sidebar-item">
                {hasChildren ? (
                  <>
                    <div
                      onClick={(e) => toggleSubmenu(item.path, e)}
                      className={`sidebar-link ${isParentActive ? 'active' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleSubmenu(item.path, e as any);
                        }
                      }}
                    >
                      <span className="sidebar-link-content">
                        <IconComponent className="sidebar-icon" size={18} />
                        <span className="sidebar-label">{item.label}</span>
                      </span>
                      <Icons.ChevronDown
                        className={`sidebar-chevron ${
                          isSubmenuOpen ? 'sidebar-chevron--open' : ''
                        }`}
                        size={14}
                      />
                    </div>

                    {isSubmenuOpen && (
                      <ul className="sidebar-submenu">
                        {item.children?.map((sub) => {
                          const isSubActive = pathname === sub.path;
                          return (
                            <li key={sub.path} className="sidebar-subitem">
                              <Link
                                href={sub.path}
                                className={`sidebar-sublink ${isSubActive ? 'active' : ''}`}
                              >
                                <span className="sidebar-sublink-dot" />
                                <span className="sidebar-sublink-label">
                                  {sub.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="sidebar-link-content">
                      <IconComponent className="sidebar-icon" size={18} />
                      <span className="sidebar-label">{item.label}</span>
                    </span>
                    {item.hasChevron && (
                      <Icons.ChevronDown className="sidebar-chevron" size={14} />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
