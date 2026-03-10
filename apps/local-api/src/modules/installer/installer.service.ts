import { Injectable } from '@nestjs/common';
import { InstallSessionStatus } from '@openclaw/shared-types';

const states: InstallSessionStatus['state'][] = ['INIT','CHECK_OS','CHECK_ENV','LOGIN','FETCH_PLANS','SELECT_PLAN_OR_CUSTOM','PAY','ACTIVATE_LICENSE','PREPARE_INSTALL','INSTALL_OPENCLAW','GENERATE_CONFIG','CONFIGURE_MODEL','CONFIGURE_CHANNEL','INSTALL_DAEMON','START_GATEWAY','HEALTH_CHECK','DONE'];

@Injectable()
export class InstallerService {
  private sessions = new Map<string, InstallSessionStatus>();
  createSession() { const id = crypto.randomUUID(); const s = { id, state: 'INIT' as const, progress: 0, message: '会话已创建', updatedAt: new Date().toISOString() }; this.sessions.set(id, s); return s; }
  getStatus(id: string) { return this.sessions.get(id) ?? this.createSession(); }
  start(id: string) { const curr = this.getStatus(id); const idx = states.indexOf(curr.state); const next = states[Math.min(idx + 1, states.length - 1)]; const status = { ...curr, state: next, progress: Math.round(((states.indexOf(next)+1)/states.length)*100), message: `当前阶段: ${next}`, updatedAt: new Date().toISOString() }; this.sessions.set(id, status); return status; }
  retry(id: string) { const s = this.getStatus(id); s.state = 'PREPARE_INSTALL'; s.message = '重试安装'; this.sessions.set(id, s); return s; }
  rollback(id: string) { const s = this.getStatus(id); s.state = 'INSTALL_FAILED'; s.message = '已触发回滚占位逻辑'; this.sessions.set(id, s); return s; }
}
