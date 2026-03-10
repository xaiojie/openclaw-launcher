import React from 'react';
export const PageHeader: React.FC<{ title?: string; description?: string }> = ({ title, description }) => (
  <div><h3>{title ?? 'PageHeader'}</h3><p>{description ?? 'TODO: PageHeader component'}</p></div>
);
