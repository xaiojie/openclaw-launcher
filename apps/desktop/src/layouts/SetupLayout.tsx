import { Layout, Typography } from 'antd'; import { Outlet } from 'react-router-dom';
export const SetupLayout = () => <Layout><Layout.Content style={{padding:24}}><Typography.Title level={3}>OpenClaw 安装向导</Typography.Title><Outlet/></Layout.Content></Layout>;
