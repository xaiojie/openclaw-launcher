import { api } from './api';
export const authService = { ping: () => api('/health/install') };
