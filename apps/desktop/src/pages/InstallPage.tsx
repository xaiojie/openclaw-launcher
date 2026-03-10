import { useEffect } from 'react';
import { Card, Progress, Typography } from 'antd';
import { useInstallStore } from '../store/install-store';
import { pollInstallStatus, startInstall } from '../services/runtime';

export const InstallPage = () => {
  const { sessionId, state, progress, message, setStatus } = useInstallStore();
  useEffect(() => {
    if (!sessionId) return;
    startInstall(sessionId).catch(() => undefined);
    const timer = setInterval(async () => {
      const data = await pollInstallStatus(sessionId);
      setStatus(data);
    }, 2000);
    return () => clearInterval(timer);
  }, [sessionId, setStatus]);

  return <Card title="InstallPage"><Typography.Text>{state} - {message}</Typography.Text><Progress percent={progress} /></Card>;
};
