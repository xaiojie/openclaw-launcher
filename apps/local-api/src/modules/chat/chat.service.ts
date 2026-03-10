import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createProvider } from '../../../../../packages/model-adapters/src';
import { PrismaService } from '../../prisma/prisma.service';
import { SendChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async send(dto: SendChatDto) {
    const config = await this.prisma.local_model_configs.findUnique({
      where: { provider: 'deepseek' }
    });

    if (!config || !config.api_key) {
      throw new BadRequestException('请先在模型配置中填写 DeepSeek API Key');
    }

    const conversation = dto.conversationId
      ? await this.findConversation(dto.conversationId)
      : await this.prisma.chat_conversations.create({
          data: {
            title: this.buildTitle(dto.message)
          }
        });

    await this.prisma.chat_messages.create({
      data: {
        conversation_id: conversation.id,
        role: 'user',
        content: dto.message,
        provider: 'deepseek',
        model: config.model
      }
    });

    const history = (await this.prisma.chat_messages.findMany({
      where: { conversation_id: conversation.id },
      orderBy: { created_at: 'asc' },
      take: 20
    })) as Array<{ role: string; content: string }>;

    const provider = createProvider('deepseek');
    const reply = await provider.sendChat(
      {
        model: config.model,
        messages: history.map((item) => ({
          role: item.role as 'system' | 'user' | 'assistant',
          content: item.content
        }))
      },
      {
        apiKey: config.api_key,
        baseUrl: config.base_url ?? undefined
      }
    );

    const assistantMessage = await this.prisma.chat_messages.create({
      data: {
        conversation_id: conversation.id,
        role: 'assistant',
        content: reply.content,
        provider: 'deepseek',
        model: config.model
      }
    });

    await this.prisma.chat_conversations.update({
      where: { id: conversation.id },
      data: {
        updated_at: new Date()
      }
    });

    return {
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.created_at.toISOString()
      }
    };
  }

  async listConversations() {
    const conversations = await this.prisma.chat_conversations.findMany({
      orderBy: { updated_at: 'desc' }
    });

    return conversations.map((item: any) => ({
      id: item.id,
      title: item.title,
      createdAt: item.created_at.toISOString(),
      updatedAt: item.updated_at.toISOString()
    }));
  }

  async listMessages(conversationId: string) {
    await this.findConversation(conversationId);

    const messages = await this.prisma.chat_messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' }
    });

    return messages.map((item: any) => ({
      id: item.id,
      conversationId: item.conversation_id,
      role: item.role,
      content: item.content,
      provider: item.provider,
      model: item.model,
      createdAt: item.created_at.toISOString()
    }));
  }

  private async findConversation(id: string) {
    const conversation = await this.prisma.chat_conversations.findUnique({
      where: { id }
    });

    if (!conversation) {
      throw new NotFoundException(`会话不存在: ${id}`);
    }

    return conversation;
  }

  private buildTitle(message: string): string {
    const plain = message.trim();
    if (!plain) {
      return '新会话';
    }
    return plain.slice(0, 24);
  }
}
