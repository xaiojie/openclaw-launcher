import { api } from './api';
export const modelService = { ping: () => api('/health/install') };
