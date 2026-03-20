import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { variants, ...productData } = createProductDto;
    
    const product = this.productRepository.create(productData);

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

  async findAll() {
    return await this.productRepository.find({
      relations: ['variants', 'variants.color']
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'variants.color']
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    const updatedProduct = this.productRepository.merge(product, updateProductDto);
    return await this.productRepository.save(updatedProduct);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.softRemove(product);
  }
}
