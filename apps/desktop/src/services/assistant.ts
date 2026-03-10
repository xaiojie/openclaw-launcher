import { api } from './api';
export const assistantService = { ping: () => api('/health/install') };
