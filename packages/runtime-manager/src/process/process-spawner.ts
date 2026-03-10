import { ChildProcess, spawn } from 'child_process';
import { 命令执行结果, 命令执行选项, 日志监听器, 日志来源 } from '../types';

export class ProcessSpawner {
  constructor(private readonly logListener?: 日志监听器) {}

  run(command: string, args: string[], options: 命令执行选项 = {}): Promise<命令执行结果> {
    return new Promise<命令执行结果>((resolve, reject) => {
      const child = this.spawn(command, args, options);
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });

      child.once('error', (error) => {
        this.emit(options.source ?? 'runtime', 'error', `命令执行失败: ${error.message}`);
        reject(error);
      });

      child.once('close', (code) => {
        const exitCode = code ?? -1;
        if (exitCode !== 0) {
          reject(new Error(`命令退出码异常: ${command} ${args.join(' ')} => ${exitCode}`));
          return;
        }

        resolve({
          command,
          args,
          code: exitCode,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });
    });
  }

  spawn(command: string, args: string[], options: 命令执行选项 = {}): ChildProcess {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: options.shell ?? false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const source = options.source ?? 'runtime';

    this.bindOutput(child.stdout, source, 'info');
    this.bindOutput(child.stderr, source, 'error');
    this.emit(source, 'info', `执行命令: ${command} ${args.join(' ')}`);

    return child;
  }

  private bindOutput(
    stream: NodeJS.ReadableStream | null,
    source: 日志来源,
    level: 'info' | 'error'
  ): void {
    if (!stream) {
      return;
    }
    let buffer = '';
    stream.on('data', (chunk: Buffer | string) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const message = line.trim();
        if (!message) {
          continue;
        }
        this.emit(source, level, message);
      }
    });
  }

  private emit(source: 日志来源, level: 'info' | 'warn' | 'error', message: string): void {
    this.logListener?.({
      timestamp: new Date().toISOString(),
      source,
      level,
      message
    });
  }
}
