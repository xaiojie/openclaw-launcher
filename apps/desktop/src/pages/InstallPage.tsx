import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  List,
  Progress,
  Space,
  Tag,
  Typography,
  message as antdMessage
} from 'antd';
import { useInstallStore } from '../store/install-store';
import { createInstallSession, pollInstallStatus, startInstallSession } from '../services/runtime';

const 终态列表 = new Set(['DONE', 'INSTALL_FAILED']);

export const InstallPage = () => {
  const { sessionId, state, progress, message, logs, setSessionId, setStatus } = useInstallStore();
  const [starting, setStarting] = useState(false);

  const stateColor = useMemo(() => {
    if (state === 'DONE') {
      return 'success';
    }
    if (state === 'INSTALL_FAILED') {
      return 'error';
    }
    return 'processing';
  }, [state]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const data = await pollInstallStatus(sessionId);
        setStatus(data);
        if (终态列表.has(data.state)) {
          window.clearInterval(timer);
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        antdMessage.error(`获取安装状态失败: ${detail}`);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [sessionId, setStatus]);

  const handleStartInstall = async () => {
    setStarting(true);
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const created = await createInstallSession();
        currentSessionId = created.id;
        setSessionId(created.id);
        setStatus(created);
      }

      const status = await startInstallSession(currentSessionId);
      setStatus(status);
      antdMessage.success('安装任务已启动');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`启动安装失败: ${detail}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card title="OpenClaw 安装中心">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          type={state === 'INSTALL_FAILED' ? 'error' : 'info'}
          message={message}
          description={`当前阶段：${state}`}
          showIcon
        />
        <div>
          <Space>
            <Tag color={stateColor}>{state}</Tag>
            <Typography.Text>安装进度：{progress}%</Typography.Text>
          </Space>
          <Progress percent={progress} status={state === 'INSTALL_FAILED' ? 'exception' : undefined} />
        </div>

        <Button type="primary" loading={starting} onClick={handleStartInstall}>
          {sessionId ? '继续安装 OpenClaw' : '安装 OpenClaw'}
        </Button>

        <Card type="inner" title="安装日志">
          <List
            locale={{ emptyText: '暂无日志，点击安装后开始输出' }}
            dataSource={[...logs].reverse()}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {item.timestamp} [{item.source}] {item.level}
                  </Typography.Text>
                  <Typography.Text>{item.message}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </Card>
  );
};
