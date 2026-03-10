import { Layout, Menu } from 'antd'; import { Outlet } from 'react-router-dom';
export const MainLayout = () => <Layout><Layout.Sider><Menu items={[{key:'dashboard',label:'Dashboard'}]} /></Layout.Sider><Layout.Content style={{padding:16}}><Outlet/></Layout.Content></Layout>;
