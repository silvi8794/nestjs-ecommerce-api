import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token/jwt-access-token.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { RoleList } from '../role/entities/constants';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand (Admin only)' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'List of brands' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a brand by slug' })
  @ApiResponse({ status: 200, description: 'The brand data' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findOneBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a brand (Admin only)' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a brand (Admin only)' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
