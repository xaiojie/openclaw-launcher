export interface LlmProvider { name: string; validate(config: Record<string, unknown>): boolean }
