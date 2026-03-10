import { ChildProcess } from 'child_process';
import { ProcessSpawner } from './process-spawner';
import { 日志监听器, 运行时上下文 } from '../types';

export interface 网关状态 {
  running: boolean;
  pid: number | null;
}

export class GatewayManager {
  private gatewayProcess: ChildProcess | null = null;

  constructor(private readonly spawner: ProcessSpawner = new ProcessSpawner()) {}

  async start(ctx: 运行时上下文, logListener?: 日志监听器): Promise<网关状态> {
    if (this.gatewayProcess && this.gatewayProcess.exitCode === null && !this.gatewayProcess.killed) {
      return { running: true, pid: this.gatewayProcess.pid ?? null };
    }

    const emit = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'gateway',
        level,
        message
      });
    };

    const commandResult = await this.resolveStartCommand(ctx, emit);
    this.gatewayProcess = this.spawner.spawn(commandResult.command, commandResult.args, {
      cwd: ctx.gatewayCwd,
      env: ctx.env,
      source: 'gateway'
    });

    this.gatewayProcess.once('close', (code) => {
      emit(`Gateway 进程已退出，退出码: ${code ?? -1}`, code === 0 ? 'info' : 'warn');
      this.gatewayProcess = null;
    });

    emit(`Gateway 已启动，PID: ${this.gatewayProcess.pid ?? '未知'}`);
    return { running: true, pid: this.gatewayProcess.pid ?? null };
  }

  async stop(logListener?: 日志监听器): Promise<网关状态> {
    const emit = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'gateway',
        level,
        message
      });
    };

    if (!this.gatewayProcess || this.gatewayProcess.exitCode !== null || this.gatewayProcess.killed) {
      emit('Gateway 当前未运行');
      this.gatewayProcess = null;
      return { running: false, pid: null };
    }

    const pid = this.gatewayProcess.pid;
    if (process.platform === 'win32' && pid) {
      try {
        await this.spawner.run('taskkill', ['/PID', String(pid), '/T', '/F'], {
          source: 'gateway'
        });
        emit(`已通过 taskkill 停止 Gateway，PID: ${pid}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        emit(`taskkill 停止失败，将回退到 kill: ${message}`, 'warn');
        this.gatewayProcess.kill('SIGTERM');
      }
    } else {
      this.gatewayProcess.kill('SIGTERM');
    }

    this.gatewayProcess = null;
    return { running: false, pid: null };
  }

  async restart(ctx: 运行时上下文, logListener?: 日志监听器): Promise<网关状态> {
    await this.stop(logListener);
    return this.start(ctx, logListener);
  }

  status(): 网关状态 {
    const running = Boolean(
      this.gatewayProcess && this.gatewayProcess.exitCode === null && !this.gatewayProcess.killed
    );

    return {
      running,
      pid: running ? this.gatewayProcess?.pid ?? null : null
    };
  }

  private async resolveStartCommand(
    ctx: 运行时上下文,
    emit: (message: string, level?: 'info' | 'warn' | 'error') => void
  ): Promise<{ command: string; args: string[] }> {
    if (ctx.gatewayStartCommand.trim()) {
      return {
        command: ctx.gatewayStartCommand,
        args: ctx.gatewayStartArgs
      };
    }

    const hasOpenClaw = await this.hasOpenClawBinary();
    if (hasOpenClaw) {
      if (ctx.platform === 'win32') {
        return {
          command: 'powershell.exe',
          args: ['-ExecutionPolicy', 'Bypass', '-Command', 'openclaw gateway start']
        };
      }

      return {
        command: 'bash',
        args: ['-lc', 'openclaw gateway start']
      };
    }

    emit('未检测到 openclaw 命令，自动启动本地 Mock Gateway', 'warn');
    const script = "const http=require('http');const server=http.createServer((req,res)=>{if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',mode:'mock'}));return;}res.writeHead(404);res.end('not found');});server.listen(18789,'127.0.0.1',()=>console.log('Mock Gateway listening on 18789'));setInterval(()=>{},1<<30);";

    return {
      command: process.execPath,
      args: ['-e', script]
    };
  }

  private async hasOpenClawBinary(): Promise<boolean> {
    try {
      if (process.platform === 'win32') {
        await this.spawner.run('where.exe', ['openclaw'], { source: 'gateway' });
      } else {
        await this.spawner.run('which', ['openclaw'], { source: 'gateway' });
      }
      return true;
    } catch {
      return false;
    }
  }
}
