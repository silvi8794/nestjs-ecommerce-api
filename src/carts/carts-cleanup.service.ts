import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartsService } from './carts.service';

@Injectable()
export class CartsCleanupService {
  private readonly logger = new Logger(CartsCleanupService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly cartsService: CartsService,
  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  //@Cron(CronExpression.EVERY_10_SECONDS)
  async cancelAbandonedPendingOrders() {
    this.logger.log('Iniciando limpieza de carritos abandonados...');

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const abandonedCarts = await this.cartRepository.find({
      where: {
        status: CartStatus.PENDING_APPROVAL,
        updatedAt: LessThan(twentyFourHoursAgo),
      },
    });

    if (abandonedCarts.length === 0) {
      this.logger.log('No hay pedidos pendientes expirados. Todo limpio.');
      return;
    }

    for (const cart of abandonedCarts) {
      try {
        await this.cartsService.rejectOrder(cart.id);
        this.logger.log(`Carrito abandonado #${cart.id} cancelado y stock restaurado.`);
      } catch (error) {
        this.logger.error(`Error cancelando el carrito #${cart.id}`, error);
      }
    }
  }
}
