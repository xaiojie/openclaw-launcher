import React from 'react';
export const UsageChart: React.FC<{ title?: string; description?: string }> = ({ title, description }) => (
  <div><h3>{title ?? 'UsageChart'}</h3><p>{description ?? 'TODO: UsageChart component'}</p></div>
);
