import { deepseekProvider } from './providers/deepseek';
import { LlmProvider } from './llm-provider';

const providerMap: Record<string, LlmProvider> = {
  deepseek: deepseekProvider
};

export const createProvider = (providerName: string): LlmProvider => {
  const provider = providerMap[providerName];
  if (!provider) {
    throw new Error(`不支持的模型提供商: ${providerName}`);
  }
  return provider;
};
