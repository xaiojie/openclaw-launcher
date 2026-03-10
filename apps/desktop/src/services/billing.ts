import { api } from './api';
export const billingService = { ping: () => api('/health/install') };
