import { LlmProvider } from '../llm-provider';

const unsupported = async () => {
  throw new Error('OpenAI Provider 尚未在 MVP 阶段启用');
};

export const openaiProvider: LlmProvider = {
  name: 'openai',
  validate: () => true,
  sendChat: unsupported,
  ping: async () => ({ ok: false, message: 'OpenAI Provider 尚未在 MVP 阶段启用' })
};
