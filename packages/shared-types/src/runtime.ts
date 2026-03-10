export type InstallState =
  | 'INIT' | 'CHECK_OS' | 'CHECK_ENV' | 'LOGIN' | 'FETCH_PLANS' | 'SELECT_PLAN_OR_CUSTOM' | 'PAY'
  | 'ACTIVATE_LICENSE' | 'PREPARE_INSTALL' | 'INSTALL_OPENCLAW' | 'GENERATE_CONFIG' | 'CONFIGURE_MODEL'
  | 'CONFIGURE_CHANNEL' | 'INSTALL_DAEMON' | 'START_GATEWAY' | 'HEALTH_CHECK' | 'DONE'
  | 'INSTALL_FAILED' | 'CONFIG_FAILED' | 'CHANNEL_FAILED' | 'DAEMON_FAILED' | 'HEALTH_FAILED';
export interface InstallSessionStatus { id: string; state: InstallState; progress: number; message: string; updatedAt: string }
