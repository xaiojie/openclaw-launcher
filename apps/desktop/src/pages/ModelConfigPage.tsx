import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Typography, message as antdMessage } from 'antd';
import { modelService } from '../services/model';

interface FormValues {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export const ModelConfigPage = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState('');

  const loadConfig = async () => {
    try {
      const config = await modelService.get();
      form.setFieldsValue({
        model: config.model,
        baseUrl: config.baseUrl ?? ''
      });
      setMaskedApiKey(config.maskedApiKey);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`加载模型配置失败: ${detail}`);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const submit = async (testConnection: boolean) => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const result = await modelService.save({
        provider: 'deepseek',
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl?.trim() || undefined,
        testConnection
      });

      setMaskedApiKey(result.maskedApiKey);
      if (testConnection) {
        if (result.testResult?.ok) {
          antdMessage.success('DeepSeek 连接测试成功');
        } else {
          antdMessage.error(result.testResult?.message ?? '连接测试失败');
        }
      } else {
        antdMessage.success('模型配置已保存');
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      antdMessage.error(`保存配置失败: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="模型配置（DeepSeek）">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          showIcon
          type="info"
          message="请输入 DeepSeek API Key，配置后即可在桌面端直接聊天"
          description={maskedApiKey ? `当前已保存 Key：${maskedApiKey}` : '当前未保存 API Key'}
        />

        <Form layout="vertical" form={form} initialValues={{ model: 'deepseek-chat' }}>
          <Form.Item
            label="DeepSeek API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="请输入 DeepSeek API Key" />
          </Form.Item>

          <Form.Item label="模型名称" name="model" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input placeholder="例如：deepseek-chat" />
          </Form.Item>

          <Form.Item label="接口地址（可选）" name="baseUrl">
            <Input placeholder="默认使用 https://api.deepseek.com" />
          </Form.Item>

          <Space>
            <Button type="primary" loading={loading} onClick={() => void submit(false)}>
              保存配置
            </Button>
            <Button loading={loading} onClick={() => void submit(true)}>
              测试连接
            </Button>
          </Space>
        </Form>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          注意：API Key 仅保存在本机 SQLite，不会上传到云端。
        </Typography.Paragraph>
      </Space>
    </Card>
  );
};
