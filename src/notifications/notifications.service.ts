import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) { }

  @OnEvent('order.approved', { async: true })
  async handleOrderApprovedEvent(payload: any) {
    this.logger.log(`1. ¡Evento capturado! Generando factura para el carrito #${payload.cartId}...`);

    await new Promise(resolve => setTimeout(resolve, 4000));

    this.logger.log(`2. ✅ ¡Email enviado al usuario #${payload.userId}! (Simulado)`);

    // Push en tiempo real al panel de admin via WebSocket
    this.gateway.notifyAdmins(payload);
  }
}
