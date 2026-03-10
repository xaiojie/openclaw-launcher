import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Tag, message as antdMessage } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RuntimeStatus } from '@openclaw/shared-types';
import { getRuntimeStatus, restartRuntime, startRuntime, stopRuntime } from '../services/runtime';

const 状态颜色映射: Record<RuntimeStatus['state'], string> = {
  running: 'success',
  stopped: 'default',
  not_installed: 'warning'
};

const 状态文案映射: Record<RuntimeStatus['state'], string> = {
  running: '运行中',
  stopped: '已停止',
  not_installed: '未安装'
};

export const RuntimePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RuntimeStatus | null>(null);

  const loadStatus = async () => {
    try {
      const data = await getRuntimeStatus();
      setStatus(data);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`获取运行状态失败: ${detail}`);
    }
  };

  useEffect(() => {
    void loadStatus();
    const timer = window.setInterval(() => {
      void loadStatus();
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const runAction = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    try {
      if (action === 'start') {
        await startRuntime();
        antdMessage.success('AI 助手启动成功');
      } else if (action === 'stop') {
        await stopRuntime();
        antdMessage.success('AI 助手已停止');
      } else {
        await restartRuntime();
        antdMessage.success('AI 助手已重启');
      }
      await loadStatus();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`操作失败: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="运行时管理">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          showIcon
          type={status?.state === 'running' ? 'success' : 'info'}
          message={
            status
              ? `当前状态：${状态文案映射[status.state]}`
              : '正在获取 OpenClaw 运行状态'
          }
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="OpenClaw 状态">
            {status ? <Tag color={状态颜色映射[status.state]}>{状态文案映射[status.state]}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="安装状态">{status?.installed ? '已安装' : '未安装'}</Descriptions.Item>
          <Descriptions.Item label="健康状态">{status?.healthy ? '健康' : '未通过'}</Descriptions.Item>
          <Descriptions.Item label="进程 PID">{status?.pid ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{status?.updatedAt ?? '-'}</Descriptions.Item>
        </Descriptions>

        <Space wrap>
          <Button type="primary" onClick={() => navigate('/setup/install')}>
            安装 OpenClaw
          </Button>
          <Button type="primary" loading={loading} onClick={() => void runAction('start')}>
            启动助手
          </Button>
          <Button danger loading={loading} onClick={() => void runAction('stop')}>
            停止助手
          </Button>
          <Button loading={loading} onClick={() => void runAction('restart')}>
            重启助手
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
