export type 聊天角色 = 'system' | 'user' | 'assistant';

export interface 聊天消息 {
  role: 聊天角色;
  content: string;
}

export interface 聊天请求参数 {
  model: string;
  messages: 聊天消息[];
  temperature?: number;
  max_tokens?: number;
}

export interface 提供商配置 {
  apiKey: string;
  baseUrl?: string;
}

export interface 聊天响应 {
  content: string;
  raw: unknown;
}

export interface 连接测试结果 {
  ok: boolean;
  message: string;
}

export interface LlmProvider {
  name: string;
  validate(config: Record<string, unknown>): boolean;
  sendChat(params: 聊天请求参数, config: 提供商配置): Promise<聊天响应>;
  ping(config: 提供商配置): Promise<连接测试结果>;
}
