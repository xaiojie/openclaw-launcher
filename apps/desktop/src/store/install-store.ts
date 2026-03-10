import { create } from 'zustand';
import { InstallSessionStatus } from '@openclaw/shared-types';

type InstallStateStore = InstallSessionStatus & {
  sessionId?: string;
  setSessionId: (id: string) => void;
  setStatus: (status: InstallSessionStatus) => void;
};

const initialStatus: InstallSessionStatus = {
  id: '',
  state: 'INIT',
  progress: 0,
  message: '等待开始',
  logs: [],
  updatedAt: new Date().toISOString()
};

export const useInstallStore = create<InstallStateStore>((set) => ({
  ...initialStatus,
  sessionId: undefined,
  setSessionId: (sessionId) => set({ sessionId }),
  setStatus: (status) => set({ ...status })
}));
