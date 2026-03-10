import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Grid,
  Input,
  List,
  Space,
  Spin,
  Typography,
  message as antdMessage
} from 'antd';
import { ChatConversation, ChatMessage } from '@openclaw/shared-types';
import { chatService } from '../services/chat';

export const ChatPage = () => {
  const screens = Grid.useBreakpoint();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const loadConversations = async () => {
    try {
      const data = await chatService.conversations();
      setConversations(data);

      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`加载会话列表失败: ${detail}`);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const data = await chatService.messages(conversationId);
      setMessages(data);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`加载消息失败: ${detail}`);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeConversationId);
  }, [activeConversationId]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) {
      return;
    }

    setSending(true);
    try {
      const response = await chatService.send({
        message: content,
        conversationId: activeConversationId ?? undefined
      });
      setInputValue('');

      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
        await loadConversations();
      }

      await loadMessages(response.conversationId);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`发送失败: ${detail}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="AI 聊天">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: screens.md ? '280px 1fr' : '1fr',
          gap: 16
        }}
      >
        <Card type="inner" title="会话列表" bodyStyle={{ padding: 0 }}>
          <List
            locale={{ emptyText: '暂无会话，发送第一条消息即可创建' }}
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  paddingInline: 12,
                  background: item.id === activeConversationId ? '#f0f5ff' : undefined
                }}
                onClick={() => setActiveConversationId(item.id)}
              >
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {item.updatedAt}
                  </Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        <Card
          type="inner"
          title={activeConversation ? `当前会话：${activeConversation.title}` : '新会话'}
          extra={
            <Button onClick={() => setActiveConversationId(null)}>
              新建会话
            </Button>
          }
        >
          <div style={{ minHeight: 360, maxHeight: 460, overflowY: 'auto', marginBottom: 12 }}>
            <Spin spinning={loadingMessages}>
              {messages.length === 0 ? (
                <Empty description="输入消息开始聊天" />
              ) : (
                <List
                  dataSource={messages}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <Typography.Text strong>
                          {item.role === 'assistant' ? 'AI 助手' : '你'}
                        </Typography.Text>
                        <Typography.Paragraph style={{ marginBottom: 4, marginTop: 4 }}>
                          {item.content}
                        </Typography.Paragraph>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {item.createdAt}
                        </Typography.Text>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </div>

          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={inputValue}
              placeholder="请输入消息，例如：帮我生成一个项目启动清单"
              onChange={(event) => setInputValue(event.target.value)}
              onPressEnter={() => void handleSend()}
            />
            <Button type="primary" loading={sending} onClick={() => void handleSend()}>
              发送
            </Button>
          </Space.Compact>
        </Card>
      </div>
    </Card>
  );
};
