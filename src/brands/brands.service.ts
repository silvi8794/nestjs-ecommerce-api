import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const brand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(brand);
  }

  async findAll() {
    return await this.brandRepository.find({
      relations: ['products']
    });
  }

  async findOne(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products']
    });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    this.brandRepository.merge(brand, updateBrandDto);
    return await this.brandRepository.save(brand);
  }

  async remove(id: number) {
    const brand = await this.findOne(id);
    return await this.brandRepository.remove(brand);
  }
}
