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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token/jwt-access-token.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { RoleList } from '../role/entities/constants';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiResponse({ status: 200, description: 'The category data' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
