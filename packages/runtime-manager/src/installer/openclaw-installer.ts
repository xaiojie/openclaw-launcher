import { spawn } from 'child_process';
import { RuntimeContext } from '../types';

export class OpenClawInstaller {
  async install(ctx: RuntimeContext): Promise<void> {
    if (ctx.platform === 'win32') {
      spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', 'install-openclaw.ps1']);
      return;
    }
    if (ctx.platform === 'darwin') {
      spawn('bash', ['install-openclaw.sh']);
      return;
    }
    // TODO: WSL2 fallback interface placeholder
  }
}
