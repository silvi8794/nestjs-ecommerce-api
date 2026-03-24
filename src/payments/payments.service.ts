import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Cart } from '../carts/entities/cart.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      console.warn('MP_ACCESS_TOKEN is not defined in environment variables');
    }
    this.client = new MercadoPagoConfig({
      accessToken: accessToken || 'TEST-ACCESS-TOKEN',
    });
  }

  async createPreference(cart: Cart) {
    const preference = new Preference(this.client);
    
    const items = cart.items.map(item => ({
      id: item.productVariant.id.toString(),
      title: `${item.productVariant.product?.name || 'Producto'} - ${item.productVariant.sku}`,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: 'ARS',
    }));

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const webhookUrl = this.configService.get<string>('MP_WEBHOOK_URL');

    const body = {
      items,
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      external_reference: String(cart.id),
      notification_url: webhookUrl || undefined,
    };

    try {
      const response = await preference.create({ body });
      console.log('Mercado Pago Preference created:', response.id);
      return response.init_point;
    } catch (error) {
      console.error('Mercado Pago Error:', error.message);
      if (error.response) {
        console.error('MP API Details:', JSON.stringify(error.response, null, 2));
      }
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    const topic = payload.topic || payload.type;
    const paymentId = payload.data?.id || payload.id;

    // --- MODO PRUEBA LOCAL (Simulación para cart 14 o cualquier otro) ---
    if (paymentId === '123456789' && payload.test_cart_id) {
      console.log('--- TEST MODE: Simulating payment for cart', payload.test_cart_id, '---');
      this.eventEmitter.emit('payment.updated', {
        cartId: Number(payload.test_cart_id),
        status: 'approved',
        paymentId: '123456789',
        details: { message: 'MOCKED_SUCCESS' }
      });
      return { mocked: true };
    }

    if (topic === 'payment') {
      try {
        const payment = await new Payment(this.client).get({ id: paymentId });
        console.log('Payment details fetched:', { id: payment.id, status: payment.status, external_reference: payment.external_reference });
        
        if (payment.external_reference) {
          this.eventEmitter.emit('payment.updated', {
            cartId: Number(payment.external_reference),
            status: payment.status,
            paymentId: payment.id,
            details: payment
          });
        }
      } catch (error) {
        console.error('Error processing Mercado Pago webhook:', error);
      }
    }
  }
}
