import { 健康检查结果 } from '../types';

export class HealthChecker {
  private timer: NodeJS.Timeout | null = null;

  async check(url: string): Promise<健康检查结果> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      return {
        healthy: response.ok,
        statusCode: response.status,
        detail: response.ok ? '健康检查通过' : `健康检查失败: ${response.status}`,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        healthy: false,
        statusCode: null,
        detail: `健康检查异常: ${message}`,
        checkedAt: new Date().toISOString()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  startPeriodicCheck(
    url: string,
    intervalMs: number,
    onResult: (result: 健康检查结果) => void
  ): void {
    this.stopPeriodicCheck();
    const run = async () => {
      const result = await this.check(url);
      onResult(result);
    };

    void run();
    this.timer = setInterval(() => {
      void run();
    }, intervalMs);
  }

  stopPeriodicCheck(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
