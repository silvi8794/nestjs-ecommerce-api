import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from "class-validator";

import { CreateVariantDto } from "./create-variant.dto";
import { Type } from "class-transformer";

export class CreateProductDto {
    @ApiProperty({ example: 'Smartphone X' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'A high-end smartphone with a clinical camera.' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'smartphone-x', required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ example: 999.99 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    categoryId?: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    brandId?: number;

    @ApiProperty({ type: [CreateVariantDto], required: false })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateVariantDto)
    variants?: CreateVariantDto[];
}
