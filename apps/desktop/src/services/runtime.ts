import { InstallSessionStatus, RuntimeStatus } from '@openclaw/shared-types';
import { api } from './api';

export interface RuntimeLogItem {
  id: string;
  source: string;
  level: 'info' | 'warn' | 'error';
  stage?: string | null;
  message: string;
  createdAt: string;
  installSessionId?: string | null;
  runtimeInstanceId?: string | null;
}

export const createInstallSession = () =>
  api<InstallSessionStatus>('/install/session', {
    method: 'POST'
  });

export const startInstallSession = (id: string) =>
  api<InstallSessionStatus>(`/install/session/${id}/start`, {
    method: 'POST'
  });

export const pollInstallStatus = (id: string) =>
  api<InstallSessionStatus>(`/install/session/${id}/status`);

export const getRuntimeStatus = () => api<RuntimeStatus>('/runtime/status');

export const startRuntime = () =>
  api<RuntimeStatus>('/runtime/start', {
    method: 'POST'
  });

export const stopRuntime = () =>
  api<RuntimeStatus>('/runtime/stop', {
    method: 'POST'
  });

export const restartRuntime = () =>
  api<RuntimeStatus>('/runtime/restart', {
    method: 'POST'
  });

export const getRuntimeLogs = (installSessionId?: string) => {
  const query = installSessionId
    ? `/logs/runtime?installSessionId=${encodeURIComponent(installSessionId)}`
    : '/logs/runtime';
  return api<{ logs: RuntimeLogItem[] }>(query);
};
