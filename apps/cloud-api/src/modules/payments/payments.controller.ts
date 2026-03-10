import { Body, Controller, Post } from '@nestjs/common';
@Controller('payments')
export class PaymentsController {
  @Post('create') create(@Body() body: any) { return { orderId: 'po_demo', body }; }
  @Post('confirm') confirm(@Body() body: any) { return { status: 'paid', body }; }
  @Post('webhook') webhook(@Body() body: any) { return { received: true, body }; }
}
