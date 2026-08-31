"use client";

import React from 'react';
import * as Icons from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  iconName?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This feature is currently under active development and will be available in an upcoming release.',
  iconName = 'Layers',
}) => {
  const IconComponent = (Icons as any)[iconName] || Icons.Layers;

  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <div className="placeholder-title-group">
          <div className="placeholder-icon-wrapper">
            <IconComponent size={24} />
          </div>
          <div>
            <h2 className="placeholder-title">{title}</h2>
            <p className="placeholder-subtitle">Enterprise Module</p>
          </div>
        </div>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-empty-state">
          <div className="empty-state-icon-bg">
            <IconComponent size={36} />
          </div>
          <h3 className="empty-state-title">{title} Workspace</h3>
          <p className="empty-state-text">{description}</p>
          <div className="empty-state-badge">
            <span className="badge-dot" />
            <span>Enterprise Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
