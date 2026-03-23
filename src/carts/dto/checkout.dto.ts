import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, DeliveryMethod } from '../entities/cart.entity';

export class CheckoutDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod = DeliveryMethod.PICKUP;

  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
