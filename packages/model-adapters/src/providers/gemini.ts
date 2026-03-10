import { LlmProvider } from '../llm-provider';

const unsupported = async () => {
  throw new Error('Gemini Provider 尚未在 MVP 阶段启用');
};

export const geminiProvider: LlmProvider = {
  name: 'gemini',
  validate: () => true,
  sendChat: unsupported,
  ping: async () => ({ ok: false, message: 'Gemini Provider 尚未在 MVP 阶段启用' })
};
