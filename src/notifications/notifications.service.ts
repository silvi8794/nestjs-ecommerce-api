import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Escuchará el evento y se ejecutará de forma asíncrona sin bloquear al usuario
  @OnEvent('order.approved', { async: true })
  async handleOrderApprovedEvent(payload: any) {
    this.logger.log(`1. ¡Evento Capturado asíncronamente! Generando factura y preparativo de email para el carrito #${payload.cartId}...`);
    
    // Simulamos la latencia de conectarnos con una API externa (ej: SendGrid, Mailchimp)
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    this.logger.log(`2. ✅ ¡Email con factura enviado exitosamente al usuario #${payload.userId}! (Simulado)`);
  }
}
