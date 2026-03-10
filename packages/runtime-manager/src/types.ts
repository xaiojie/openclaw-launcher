export type 支持的平台 = 'win32' | 'darwin';

export type 日志级别 = 'info' | 'warn' | 'error';

export type 日志来源 =
  | 'dependency-checker'
  | 'installer'
  | 'gateway'
  | 'health-checker'
  | 'runtime';

export interface 运行日志事件 {
  timestamp: string;
  source: 日志来源;
  level: 日志级别;
  message: string;
}

export type 日志监听器 = (event: 运行日志事件) => void;

export interface 命令执行选项 {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  source?: 日志来源;
  shell?: boolean;
}

export interface 命令执行结果 {
  command: string;
  args: string[];
  code: number;
  stdout: string;
  stderr: string;
}

export interface 运行时上下文 {
  platform: NodeJS.Platform;
  installDir: string;
  workspaceRoot: string;
  gatewayHealthUrl: string;
  gatewayStartCommand: string;
  gatewayStartArgs: string[];
  gatewayCwd: string;
  env?: NodeJS.ProcessEnv;
}

export interface 依赖检查结果 {
  osSupported: boolean;
  nodeOk: boolean;
  shellOk: boolean;
  osVersion: string;
  nodeVersion: string;
}

export interface 健康检查结果 {
  healthy: boolean;
  statusCode: number | null;
  detail: string;
  checkedAt: string;
}

export interface 安装结果 {
  installed: boolean;
  skipped: boolean;
}
