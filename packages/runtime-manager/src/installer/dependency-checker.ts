import { ProcessSpawner } from '../process/process-spawner';
import { 依赖检查结果, 日志监听器, 运行时上下文, 支持的平台 } from '../types';

const SUPPORTED_PLATFORMS: 支持的平台[] = ['win32', 'darwin'];

export class DependencyChecker {
  constructor(private readonly spawner: ProcessSpawner = new ProcessSpawner()) {}

  async check(ctx: 运行时上下文, logListener?: 日志监听器): Promise<依赖检查结果> {
    const emit = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      logListener?.({
        timestamp: new Date().toISOString(),
        source: 'dependency-checker',
        level,
        message
      });
    };

    emit('开始检查系统依赖');
    const osSupported = SUPPORTED_PLATFORMS.includes(ctx.platform as 支持的平台);
    const nodeVersion = process.version;
    const nodeOk = Number(process.versions.node.split('.')[0]) >= 18;

    let shellOk = false;
    let osVersion = 'unknown';

    try {
      if (ctx.platform === 'win32') {
        await this.spawner.run(
          'powershell.exe',
          ['-Command', '$PSVersionTable.PSVersion.ToString()'],
          { source: 'dependency-checker' }
        );
        const osVersionResult = await this.spawner.run(
          'powershell.exe',
          ['-Command', '[System.Environment]::OSVersion.VersionString'],
          { source: 'dependency-checker' }
        );
        osVersion = osVersionResult.stdout || 'Windows';
      } else if (ctx.platform === 'darwin') {
        await this.spawner.run('bash', ['--version'], { source: 'dependency-checker' });
        const osVersionResult = await this.spawner.run('sw_vers', ['-productVersion'], {
          source: 'dependency-checker'
        });
        osVersion = osVersionResult.stdout || 'macOS';
      }
      shellOk = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      emit(`Shell 依赖检查失败: ${message}`, 'error');
      shellOk = false;
    }

    emit(`平台支持: ${osSupported ? '是' : '否'}`);
    emit(`系统版本: ${osVersion}`);
    emit(`Node 版本: ${nodeVersion}，检查结果: ${nodeOk ? '通过' : '失败'}`);
    emit(`Shell 检查结果: ${shellOk ? '通过' : '失败'}`);

    return {
      osSupported,
      nodeOk,
      shellOk,
      osVersion,
      nodeVersion
    };
  }
}
