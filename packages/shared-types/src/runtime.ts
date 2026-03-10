export type InstallState =
  | 'INIT'
  | 'CHECK_OS'
  | 'CHECK_ENV'
  | 'INSTALL_OPENCLAW'
  | 'START_GATEWAY'
  | 'HEALTH_CHECK'
  | 'DONE'
  | 'INSTALL_FAILED';

export interface InstallLogItem {
  timestamp: string;
  source: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface InstallSessionStatus {
  id: string;
  state: InstallState;
  progress: number;
  message: string;
  logs: InstallLogItem[];
  updatedAt: string;
  errorMessage?: string;
}

export type RuntimeState = 'running' | 'stopped' | 'not_installed';

export interface RuntimeStatus {
  state: RuntimeState;
  running: boolean;
  installed: boolean;
  healthy: boolean;
  pid: number | null;
  updatedAt: string;
}
