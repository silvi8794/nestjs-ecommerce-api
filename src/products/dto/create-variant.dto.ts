import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateVariantDto {
    @ApiProperty({ example: 'SMART-X-64-RED' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 999.99, required: false })
    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'M', required: false })
    @IsString()
    @IsOptional()
    size?: string;

    @ApiProperty({ example: 1, required: false })
    @IsNumber()
    @IsOptional()
    colorId?: number;
}
