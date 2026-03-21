import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBrandDto {
    @ApiProperty({ example: 'Samsung' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'A globally recognized tech leader', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'samsung', required: false })
    @IsString()
    @IsOptional()
    slug?: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
