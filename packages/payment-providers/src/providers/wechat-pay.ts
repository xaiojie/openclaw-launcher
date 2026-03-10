export class WechatPayProvider {
  async createOrder() { return { provider: 'wechat-pay', status: 'pending' }; }
}
