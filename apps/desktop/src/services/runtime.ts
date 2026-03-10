import { api } from './api';
import { InstallSessionStatus } from '@openclaw/shared-types';
export const createInstallSession = () => api<{ id: string }>('/install/session', { method: 'POST' });
export const startInstall = (id: string) => api(`/install/session/${id}/start`, { method: 'POST' });
export const pollInstallStatus = (id: string) => api<InstallSessionStatus>(`/install/session/${id}/status`);
