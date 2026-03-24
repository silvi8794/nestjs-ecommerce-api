import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },  //reemplazar con el dominio del panel admin
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado al panel: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado del panel: ${client.id}`);
  }

  /**
   * Emite el evento 'order-approved' a TODOS los clientes conectados (admins).
   * Es llamado por NotificationsService cuando la IA aprueba un pago.
   */
  notifyAdmins(payload: { cartId: number; userId: number; amount: any }) {
    this.logger.log(`📡 Emitiendo notificación WebSocket para el carrito #${payload.cartId}`);
    this.server.emit('order-approved', {
      message: `✅ Nueva venta aprobada — Carrito #${payload.cartId}`,
      cartId: payload.cartId,
      userId: payload.userId,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
    });
  }
}
