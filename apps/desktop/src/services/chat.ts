import { ChatConversation, ChatMessage } from '@openclaw/shared-types';
import { api } from './api';

export const chatService = {
  send: (payload: { message: string; conversationId?: string }) =>
    api<{ conversationId: string; message: { id: string; role: string; content: string; createdAt: string } }>(
      '/chat/send',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),
  conversations: () => api<ChatConversation[]>('/chat/conversations'),
  messages: (conversationId: string) =>
    api<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`)
};
