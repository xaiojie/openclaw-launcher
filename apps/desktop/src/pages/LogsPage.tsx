import { useEffect, useState } from 'react';
import { Card, List, Space, Tag, Typography, message as antdMessage } from 'antd';
import { getRuntimeLogs, RuntimeLogItem } from '../services/runtime';
import { useInstallStore } from '../store/install-store';

export const LogsPage = () => {
  const { sessionId } = useInstallStore();
  const [logs, setLogs] = useState<RuntimeLogItem[]>([]);

  const loadLogs = async () => {
    try {
      const data = await getRuntimeLogs(sessionId);
      setLogs(data.logs);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`加载日志失败: ${detail}`);
    }
  };

  useEffect(() => {
    void loadLogs();
    const timer = window.setInterval(() => {
      void loadLogs();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [sessionId]);

  return (
    <Card title="安装与运行日志">
      <List
        locale={{ emptyText: '暂无日志' }}
        dataSource={logs}
        renderItem={(item) => (
          <List.Item>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap>
                <Tag>{item.source}</Tag>
                <Tag color={item.level === 'error' ? 'error' : item.level === 'warn' ? 'warning' : 'processing'}>
                  {item.level}
                </Tag>
                {item.stage ? <Tag color="purple">{item.stage}</Tag> : null}
                <Typography.Text type="secondary">{item.createdAt}</Typography.Text>
              </Space>
              <Typography.Text>{item.message}</Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};
