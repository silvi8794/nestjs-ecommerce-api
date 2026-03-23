import { IsNumber, IsPositive } from 'class-validator';

export class AddItemDto {
  @IsNumber()
  variantId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
