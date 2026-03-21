import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Gadgets, smartphones, and computers', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'electronics', required: false })
    @IsString()
    @IsOptional()
    slug?: string;
}
