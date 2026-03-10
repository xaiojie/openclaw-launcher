import React from 'react';
export const StatusCard: React.FC<{ title?: string; description?: string }> = ({ title, description }) => (
  <div><h3>{title ?? 'StatusCard'}</h3><p>{description ?? 'TODO: StatusCard component'}</p></div>
);
