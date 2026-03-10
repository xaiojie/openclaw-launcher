import { existsSync } from 'fs';
import path from 'path';
import { ProcessSpawner } from '../process/process-spawner';
import { 安装结果, 日志监听器, 运行时上下文 } from '../types';

export class OpenClawInstaller {
  constructor(private readonly spawner: ProcessSpawner = new ProcessSpawner()) {}

  async isInstalled(ctx: 运行时上下文, logListener?: 日志监听器): Promise<boolean> {
    const markerPath = this.getMarkerPath(ctx);
    if (existsSync(markerPath)) {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'installer',
        level: 'info',
        message: `检测到安装标记文件: ${markerPath}`
      });
      return true;
    }

    const emit = (message: string) => {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'installer',
        level: 'info',
        message
      });
    };

    if (ctx.platform === 'win32') {
      try {
        await this.spawner.run('where.exe', ['openclaw'], { source: 'installer' });
        emit('检测到系统已存在 openclaw 命令，跳过安装');
        return true;
      } catch {
        return false;
      }
    }

    if (ctx.platform === 'darwin') {
      try {
        await this.spawner.run('which', ['openclaw'], { source: 'installer' });
        emit('检测到系统已存在 openclaw 命令，跳过安装');
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  async install(ctx: 运行时上下文, logListener?: 日志监听器): Promise<安装结果> {
    const emit = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'installer',
        level,
        message
      });
    };

    const installed = await this.isInstalled(ctx, logListener);
    if (installed) {
      return { installed: true, skipped: true };
    }

    const scriptPath = this.resolveScriptPath(ctx);
    if (!existsSync(scriptPath)) {
      throw new Error(`未找到安装脚本: ${scriptPath}`);
    }

    emit(`开始执行安装脚本: ${scriptPath}`);

    const env = {
      ...process.env,
      ...ctx.env,
      OPENCLAW_INSTALL_DIR: ctx.installDir
    };

    if (ctx.platform === 'win32') {
      await this.spawner.run(
        'powershell.exe',
        ['-ExecutionPolicy', 'Bypass', '-File', scriptPath],
        {
          cwd: ctx.workspaceRoot,
          env,
          source: 'installer'
        }
      );
      emit('Windows 安装脚本执行完成');
      return { installed: true, skipped: false };
    }

    if (ctx.platform === 'darwin') {
      await this.spawner.run('bash', [scriptPath], {
        cwd: ctx.workspaceRoot,
        env,
        source: 'installer'
      });
      emit('macOS 安装脚本执行完成');
      return { installed: true, skipped: false };
    }

    throw new Error(`暂不支持的平台: ${ctx.platform}`);
  }

  getMarkerPath(ctx: 运行时上下文): string {
    return path.join(ctx.installDir, '.openclaw-installed');
  }

  private resolveScriptPath(ctx: 运行时上下文): string {
    if (ctx.platform === 'win32') {
      return path.join(ctx.workspaceRoot, 'infra', 'scripts', 'install-openclaw.ps1');
    }
    if (ctx.platform === 'darwin') {
      return path.join(ctx.workspaceRoot, 'infra', 'scripts', 'install-openclaw.sh');
    }
    return '';
  }
}
