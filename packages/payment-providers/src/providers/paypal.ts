export class PaypalProvider {
  async createOrder() { return { provider: 'paypal', status: 'pending' }; }
}
