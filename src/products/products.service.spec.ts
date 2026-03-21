import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with variants', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1,
        variants: [
          { sku: 'SKU1', price: 110, stock: 5, colorId: 1 }
        ]
      };

      const product = { ...createProductDto, id: 1, category: { id: 1 }, variants: [] };
      delete (product as any).categoryId;
      mockProductRepository.create.mockReturnValue(product);
      mockProductRepository.save.mockResolvedValue(product);

      const result = await service.create(createProductDto);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(product);
    });

    it('should create a product without variants', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        stock: 10,
      };

      const product = { ...createProductDto, id: 1 };
      mockProductRepository.create.mockReturnValue(product);
      mockProductRepository.save.mockResolvedValue(product);

      const result = await service.create(createProductDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(product);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [{ id: 1, name: 'Product 1' }];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();
      expect(result).toEqual(products);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['variants', 'variants.color', 'category', 'brand']
      });
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const product = { id: 1, name: 'Product 1' };
      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(result).toEqual(product);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['variants', 'variants.color', 'category', 'brand']
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = { name: 'Updated Product' };
      const product = { id: 1, name: 'Original Product' };
      const updatedProduct = { id: 1, name: 'Updated Product' };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.merge.mockImplementation((entity, update) => Object.assign(entity, update));
      mockProductRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, updateProductDto);

      expect(result.name).toEqual('Updated Product');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const product = { id: 1, name: 'Product 1' };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.softRemove.mockResolvedValue(product);

      const result = await service.remove(1);

      expect(result).toEqual(product);
      expect(repository.softRemove).toHaveBeenCalledWith(product);
    });
  });
});
