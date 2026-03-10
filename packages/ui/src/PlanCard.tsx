import React from 'react';
export const PlanCard: React.FC<{ title?: string; description?: string }> = ({ title, description }) => (
  <div><h3>{title ?? 'PlanCard'}</h3><p>{description ?? 'TODO: PlanCard component'}</p></div>
);
