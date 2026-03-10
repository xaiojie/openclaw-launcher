import { create } from 'zustand';
import { InstallSessionStatus } from '@openclaw/shared-types';

type State = InstallSessionStatus & { sessionId?: string; setSessionId: (id: string) => void; setStatus: (s: InstallSessionStatus) => void };

export const useInstallStore = create<State>((set) => ({
  id: '', state: 'INIT', progress: 0, message: '等待开始', updatedAt: new Date().toISOString(),
  sessionId: undefined,
  setSessionId: (sessionId) => set({ sessionId }),
  setStatus: (status) => set(status)
}));
