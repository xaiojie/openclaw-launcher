export class StripeProvider {
  async createOrder() { return { provider: 'stripe', status: 'pending' }; }
}
