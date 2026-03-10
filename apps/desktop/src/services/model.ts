import { api } from './api';

export interface ModelConfigPayload {
  provider?: 'deepseek';
  apiKey: string;
  model: string;
  baseUrl?: string;
  testConnection?: boolean;
}

export interface ModelConfigResult {
  provider: string;
  model: string;
  baseUrl: string | null;
  hasApiKey: boolean;
  maskedApiKey: string;
  testResult?: {
    ok: boolean;
    message: string;
  } | null;
}

export const modelService = {
  save: (payload: ModelConfigPayload) =>
    api<ModelConfigResult>('/config/model', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  get: () => api<ModelConfigResult>('/config/model')
};
