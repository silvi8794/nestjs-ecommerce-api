import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CartsService } from './carts.service';
import { CartsCleanupService } from './carts-cleanup.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AiModule } from '../ai/ai.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, ProductVariant]),
    MulterModule.register(),
    AiModule,
    PaymentsModule
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsCleanupService],
  exports: [CartsService]
})
export class CartsModule {}
