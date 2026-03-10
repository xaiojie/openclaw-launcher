import { api } from './api';
export const channelService = { ping: () => api('/health/install') };
