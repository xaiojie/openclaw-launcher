import { Injectable } from '@nestjs/common';
import { createProvider } from '../../../../../packages/model-adapters/src';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveModelConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async saveModelConfig(dto: SaveModelConfigDto) {
    const providerName = dto.provider ?? 'deepseek';

    const saved = await this.prisma.local_model_configs.upsert({
      where: { provider: providerName },
      create: {
        provider: providerName,
        model: dto.model,
        api_key: dto.apiKey,
        base_url: dto.baseUrl,
        is_active: true
      },
      update: {
        model: dto.model,
        api_key: dto.apiKey,
        base_url: dto.baseUrl,
        is_active: true
      }
    });

    let testResult: { ok: boolean; message: string } | null = null;
    if (dto.testConnection) {
      const provider = createProvider(providerName);
      testResult = await provider.ping({
        apiKey: dto.apiKey,
        baseUrl: dto.baseUrl
      });
    }

    return {
      provider: saved.provider,
      model: saved.model,
      baseUrl: saved.base_url,
      hasApiKey: Boolean(saved.api_key),
      maskedApiKey: this.maskApiKey(saved.api_key),
      testResult
    };
  }

  async getModelConfig() {
    const config = await this.prisma.local_model_configs.findUnique({
      where: { provider: 'deepseek' }
    });

    if (!config) {
      return {
        provider: 'deepseek',
        model: 'deepseek-chat',
        baseUrl: null,
        hasApiKey: false,
        maskedApiKey: ''
      };
    }

    return {
      provider: config.provider,
      model: config.model,
      baseUrl: config.base_url,
      hasApiKey: Boolean(config.api_key),
      maskedApiKey: this.maskApiKey(config.api_key)
    };
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '*'.repeat(apiKey.length);
    }
    return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
  }
}
