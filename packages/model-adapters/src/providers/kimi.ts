import { LlmProvider } from '../llm-provider';

const unsupported = async () => {
  throw new Error('Kimi Provider 尚未在 MVP 阶段启用');
};

export const kimiProvider: LlmProvider = {
  name: 'kimi',
  validate: () => true,
  sendChat: unsupported,
  ping: async () => ({ ok: false, message: 'Kimi Provider 尚未在 MVP 阶段启用' })
};
