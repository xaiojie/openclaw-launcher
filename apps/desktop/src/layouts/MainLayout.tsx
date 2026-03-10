import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const 菜单项: MenuProps['items'] = [
  { key: '/chat', label: '聊天首页' },
  { key: '/install', label: '安装 OpenClaw' },
  { key: '/runtime', label: '运行时管理' },
  { key: '/models', label: '模型配置' },
  { key: '/logs', label: '运行日志' }
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = 菜单项?.some((item) => item?.key === location.pathname)
    ? location.pathname
    : '/chat';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={240} theme="light" breakpoint="lg" collapsedWidth={0}>
        <div style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            OpenClaw 桌面端
          </Typography.Title>
          <Typography.Text type="secondary">MVP 第一阶段</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={菜单项}
          onClick={(event) => navigate(event.key)}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Content style={{ padding: 16 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
