export interface ChannelProvider { name: string; connect(config: Record<string, unknown>): Promise<void> }
