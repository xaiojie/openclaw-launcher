import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { RuntimeStatus } from '@openclaw/shared-types';
import {
  GatewayManager,
  HealthChecker,
  OpenClawInstaller,
  ProcessSpawner,
  运行日志事件,
  运行时上下文
} from '../../../../../packages/runtime-manager/src';
import { PrismaService } from '../../prisma/prisma.service';

export interface 运行时动作选项 {
  installSessionId?: string;
}

@Injectable()
export class RuntimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RuntimeService.name);
  private readonly spawner = new ProcessSpawner((event) => {
    void this.persistRuntimeLog(event, this.activeInstallSessionId ?? undefined);
  });
  private readonly installer = new OpenClawInstaller(this.spawner);
  private readonly gatewayManager = new GatewayManager(this.spawner);
  private readonly healthChecker = new HealthChecker();
  private activeInstallSessionId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureRuntimeInstance();
    const healthUrl = this.buildContext().gatewayHealthUrl;
    this.healthChecker.startPeriodicCheck(healthUrl, 5000, (result: { healthy: boolean; detail: string; checkedAt: string }) => {
      void this.handlePeriodicHealth(result);
    });
  }

  onModuleDestroy(): void {
    this.healthChecker.stopPeriodicCheck();
  }

  getRuntimeContext(): 运行时上下文 {
    return this.buildContext();
  }

  async getStatus(): Promise<RuntimeStatus> {
    return this.refreshStatus();
  }

  async start(options: 运行时动作选项 = {}): Promise<RuntimeStatus> {
    const ctx = this.buildContext();
    const installed = await this.installer.isInstalled(ctx);
    if (!installed) {
      throw new BadRequestException('尚未安装 OpenClaw，请先完成安装');
    }

    this.activeInstallSessionId = options.installSessionId ?? null;
    try {
      await this.gatewayManager.start(ctx, (event: 运行日志事件) => {
        void this.persistRuntimeLog(event, options.installSessionId);
      });
    } finally {
      this.activeInstallSessionId = null;
    }

    return this.refreshStatus();
  }

  async stop(options: 运行时动作选项 = {}): Promise<RuntimeStatus> {
    this.activeInstallSessionId = options.installSessionId ?? null;
    try {
      await this.gatewayManager.stop((event: 运行日志事件) => {
        void this.persistRuntimeLog(event, options.installSessionId);
      });
    } finally {
      this.activeInstallSessionId = null;
    }

    return this.refreshStatus();
  }

  async restart(options: 运行时动作选项 = {}): Promise<RuntimeStatus> {
    const ctx = this.buildContext();
    this.activeInstallSessionId = options.installSessionId ?? null;
    try {
      await this.gatewayManager.restart(ctx, (event: 运行日志事件) => {
        void this.persistRuntimeLog(event, options.installSessionId);
      });
    } finally {
      this.activeInstallSessionId = null;
    }

    return this.refreshStatus();
  }

  async checkGatewayHealth(): Promise<boolean> {
    const ctx = this.buildContext();
    const result = await this.healthChecker.check(ctx.gatewayHealthUrl);
    await this.persistRuntimeLog(
      {
        timestamp: result.checkedAt,
        source: 'health-checker',
        level: result.healthy ? 'info' : 'warn',
        message: result.detail
      },
      this.activeInstallSessionId ?? undefined
    );
    return result.healthy;
  }

  private async refreshStatus(): Promise<RuntimeStatus> {
    const ctx = this.buildContext();
    const installed = await this.installer.isInstalled(ctx);
    const gatewayStatus = this.gatewayManager.status();
    const state: RuntimeStatus['state'] = installed
      ? gatewayStatus.running
        ? 'running'
        : 'stopped'
      : 'not_installed';

    let healthy = false;
    if (gatewayStatus.running) {
      const healthResult = await this.healthChecker.check(ctx.gatewayHealthUrl);
      healthy = healthResult.healthy;
    }

    const runtime = await this.ensureRuntimeInstance();
    const updated = await this.prisma.runtime_instances.update({
      where: { id: runtime.id },
      data: {
        status: state,
        pid: gatewayStatus.pid,
        installed,
        healthy,
        health_checked_at: new Date()
      }
    });

    return {
      state,
      running: gatewayStatus.running,
      installed,
      healthy,
      pid: gatewayStatus.pid,
      updatedAt: updated.updated_at.toISOString()
    };
  }

  private async ensureRuntimeInstance() {
    const existing = await this.prisma.runtime_instances.findFirst({
      orderBy: { updated_at: 'desc' }
    });

    if (existing) {
      return existing;
    }

    this.logger.log('初始化 runtime_instances 默认记录');
    return this.prisma.runtime_instances.create({
      data: {
        status: 'not_installed',
        installed: false,
        healthy: false,
        pid: null
      }
    });
  }

  private buildContext(): 运行时上下文 {
    const workspaceRoot = this.resolveWorkspaceRoot();
    const installDir =
      process.env.OPENCLAW_INSTALL_DIR ??
      (process.platform === 'win32'
        ? `${process.env.USERPROFILE ?? workspaceRoot}\\.openclaw`
        : `${process.env.HOME ?? workspaceRoot}/.openclaw`);

    return {
      platform: process.platform,
      installDir,
      workspaceRoot,
      gatewayHealthUrl: process.env.OPENCLAW_GATEWAY_HEALTH_URL ?? 'http://localhost:18789/health',
      gatewayStartCommand: process.env.OPENCLAW_GATEWAY_COMMAND ?? '',
      gatewayStartArgs: process.env.OPENCLAW_GATEWAY_ARGS
        ? process.env.OPENCLAW_GATEWAY_ARGS.split(' ').filter(Boolean)
        : [],
      gatewayCwd: workspaceRoot,
      env: process.env
    };
  }

  private resolveWorkspaceRoot(): string {
    if (process.env.OPENCLAW_WORKSPACE_ROOT) {
      return process.env.OPENCLAW_WORKSPACE_ROOT;
    }

    let current = process.cwd();
    for (let i = 0; i < 6; i += 1) {
      if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    return path.resolve(process.cwd(), '..', '..');
  }

  private async persistRuntimeLog(event: 运行日志事件, installSessionId?: string): Promise<void> {
    const runtime = await this.ensureRuntimeInstance();
    await this.prisma.runtime_logs.create({
      data: {
        source: event.source,
        level: event.level,
        message: event.message,
        stage: null,
        install_session_id: installSessionId,
        runtime_instance_id: runtime.id
      }
    });
  }

  private async handlePeriodicHealth(result: {
    healthy: boolean;
    detail: string;
    checkedAt: string;
  }): Promise<void> {
    const ctx = this.buildContext();
    const installed = await this.installer.isInstalled(ctx);
    const gateway = this.gatewayManager.status();
    const state: RuntimeStatus['state'] = installed
      ? gateway.running
        ? 'running'
        : 'stopped'
      : 'not_installed';

    const runtime = await this.ensureRuntimeInstance();
    await this.prisma.runtime_instances.update({
      where: { id: runtime.id },
      data: {
        status: state,
        installed,
        pid: gateway.pid,
        healthy: gateway.running ? result.healthy : false,
        health_checked_at: new Date(result.checkedAt)
      }
    });

    await this.persistRuntimeLog({
      timestamp: result.checkedAt,
      source: 'health-checker',
      level: result.healthy ? 'info' : 'warn',
      message: result.detail
    });
  }
}
