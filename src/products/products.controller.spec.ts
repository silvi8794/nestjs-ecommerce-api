import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token/jwt-access-token.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        Reflector,
        JwtAccessTokenGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call productsService.create', async () => {
      const dto: CreateProductDto = { name: 'Test', price: 10, stock: 1 };
      const product = { id: 1, ...dto };
      mockProductsService.create.mockResolvedValue(product);

      const result = await controller.create(dto);

      expect(result).toEqual(product);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call productsService.findAll', async () => {
      const filterDto: ProductFilterDto = {};
      const resultData = { items: [{ id: 1, name: 'Product 1' }], total: 1, limit: 10, offset: 0 };
      mockProductsService.findAll.mockResolvedValue(resultData);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(resultData);
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOneBySlug', async () => {
      const product = { id: 1, name: 'Product 1', slug: 'product-1' };
      mockProductsService.findOneBySlug.mockResolvedValue(product);

      const result = await controller.findOne('product-1');

      expect(result).toEqual(product);
      expect(service.findOneBySlug).toHaveBeenCalledWith('product-1');
    });
  });

  describe('update', () => {
    it('should call productsService.update', async () => {
      const dto: UpdateProductDto = { name: 'Updated' };
      const product = { id: 1, ...dto };
      mockProductsService.update.mockResolvedValue(product);

      const result = await controller.update(1, dto);

      expect(result).toEqual(product);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call productsService.remove', async () => {
      const product = { id: 1, name: 'Product 1' };
      mockProductsService.remove.mockResolvedValue(product);

      const result = await controller.remove(1);

      expect(result).toEqual(product);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
