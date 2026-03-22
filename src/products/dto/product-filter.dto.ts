import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { 
  IsBoolean, 
  IsInt, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsPositive, 
  Min,
  IsIn
} from 'class-validator';

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Search term for name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by brand slug' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Filter by color slugs (comma-separated)' })
  @IsOptional()
  @IsString()
  colors?: string;

  @ApiPropertyOptional({ description: 'Min price filter' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Max price filter' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Starting offset', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: ['name', 'price', 'createdAt'] })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'createdAt'])
  sort?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Ordering direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
