import { LlmProvider } from '../llm-provider';

const unsupported = async () => {
  throw new Error('Qwen Provider 尚未在 MVP 阶段启用');
};

export const qwenProvider: LlmProvider = {
  name: 'qwen',
  validate: () => true,
  sendChat: unsupported,
  ping: async () => ({ ok: false, message: 'Qwen Provider 尚未在 MVP 阶段启用' })
};
