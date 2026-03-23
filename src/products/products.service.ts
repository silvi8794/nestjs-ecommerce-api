import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const { variants, categoryId, brandId, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);

    if (categoryId) {
      product.category = { id: categoryId } as any;
    }

    if (brandId) {
      product.brand = { id: brandId } as any;
    }

    if (variants && variants.length > 0) {
      product.variants = variants.map(v => {
        const variant = new ProductVariant();
        Object.assign(variant, v);
        if (v.colorId) {
          variant.color = { id: v.colorId } as any;
        }
        return variant;
      });
    }

    return await this.productRepository.save(product);
  }

  async findAll(filterDto: ProductFilterDto) {
    const {
      search,
      category,
      brand,
      colors,
      minPrice,
      maxPrice,
      isActive,
      limit = 10,
      offset = 0,
      sort = 'createdAt',
      order = 'DESC'
    } = filterDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.color', 'color')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.description LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    if (brand) {
      queryBuilder.andWhere('brand.slug = :brand', { brand });
    }

    if (colors) {
      const colorSlugs = colors.split(',').map(s => s.trim());
      queryBuilder.andWhere('color.slug IN (:...colorSlugs)', { colorSlugs });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    queryBuilder
      .orderBy(`product.${sort}`, order)
      .skip(offset)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      limit,
      offset
    };
  }

  async findOneBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['variants', 'variants.color', 'category', 'brand']
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'variants.color', 'category', 'brand']
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { categoryId, brandId, ...updateData } = updateProductDto;
    const product = await this.findOne(id);

    this.productRepository.merge(product, updateData);

    if (categoryId) {
      product.category = { id: categoryId } as any;
    }

    if (brandId) {
      product.brand = { id: brandId } as any;
    }

    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.softRemove(product);
  }
}
