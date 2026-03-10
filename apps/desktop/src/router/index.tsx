import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { SetupLayout } from '../layouts/SetupLayout';
import * as P from '../pages';

export const AppRouter = () => (
  <Routes>
    <Route path="/setup" element={<SetupLayout />}>
      <Route path="welcome" element={<P.WelcomePage />} />
      <Route path="login" element={<P.LoginPage />} />
      <Route path="register" element={<P.RegisterPage />} />
      <Route path="plan" element={<P.PlanSelectPage />} />
      <Route path="custom" element={<P.CustomBuilderPage />} />
      <Route path="payment" element={<P.PaymentPage />} />
      <Route path="install" element={<P.InstallPage />} />
      <Route path="model" element={<P.ModelConfigPage />} />
      <Route path="channel" element={<P.ChannelConfigPage />} />
      <Route path="finish" element={<P.FinishPage />} />
    </Route>
    <Route path="/" element={<MainLayout />}>
      <Route path="dashboard" element={<P.DashboardPage />} />
      <Route path="assistants" element={<P.AssistantsPage />} />
      <Route path="runtime" element={<P.RuntimePage />} />
      <Route path="usage" element={<P.UsagePage />} />
      <Route path="billing" element={<P.BillingPage />} />
      <Route path="channels" element={<P.ChannelsPage />} />
      <Route path="models" element={<P.ModelsPage />} />
      <Route path="logs" element={<P.LogsPage />} />
      <Route path="settings" element={<P.SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/setup/welcome" replace />} />
  </Routes>
);
