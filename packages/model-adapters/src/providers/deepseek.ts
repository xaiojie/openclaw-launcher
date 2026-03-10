import {
  LlmProvider,
  聊天请求参数,
  提供商配置,
  聊天响应,
  连接测试结果
} from '../llm-provider';

interface DeepSeekChoice {
  message?: {
    content?: string;
  };
}

interface DeepSeekResponse {
  choices?: DeepSeekChoice[];
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com';

const callDeepSeek = async (
  params: 聊天请求参数,
  config: 提供商配置
): Promise<聊天响应> => {
  const baseUrl = config.baseUrl?.trim() || DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek 调用失败(${response.status}): ${detail}`);
  }

  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('DeepSeek 返回内容为空');
  }

  return {
    content,
    raw: data
  };
};

const pingDeepSeek = async (config: 提供商配置): Promise<连接测试结果> => {
  try {
    await callDeepSeek(
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 8,
        temperature: 0
      },
      config
    );

    return {
      ok: true,
      message: '连接测试成功'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      message
    };
  }
};

export const deepseekProvider: LlmProvider = {
  name: 'deepseek',
  validate: (config) => {
    const apiKey = String(config.apiKey ?? '').trim();
    return apiKey.length > 0;
  },
  sendChat: (params, config) => callDeepSeek(params, config),
  ping: (config) => pingDeepSeek(config)
};
