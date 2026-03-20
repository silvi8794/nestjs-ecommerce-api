import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateColorDto {
    @ApiProperty({ example: 'Crimson Red' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '#DC143C' })
    @IsString()
    @IsOptional()
    hexCode?: string;
}
