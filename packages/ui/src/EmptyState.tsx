import React from 'react';
export const EmptyState: React.FC<{ title?: string; description?: string }> = ({ title, description }) => (
  <div><h3>{title ?? 'EmptyState'}</h3><p>{description ?? 'TODO: EmptyState component'}</p></div>
);
