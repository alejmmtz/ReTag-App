import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { Repository } from 'typeorm';
import { FilterGarmentsQueryDto } from './dto/filter-garments-query.dto';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { GarmentStatus } from '../common/types/enums';
import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from '../catalogs/entities/category.entity';
import { GarmentRulesService } from './garment-rules.service';
import { UpdateGarmentDto } from './dto/update-garment.dto';

@Injectable()
export class GarmentsService {
  constructor(
    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,

    private readonly garmentsRulesService: GarmentRulesService,
  ) {}

  async findAllGarments(
    query: FilterGarmentsQueryDto,
  ): Promise<GarmentEntity[]> {
    const queryBuilder = this.garmentsRepository.createQueryBuilder('g');

    if (query.name) {
      queryBuilder.andWhere('g.name ILIKE :name', { name: `%${query.name}%` });
    }

    if (query.sizeId) {
      queryBuilder.andWhere('g.size_id = :sizeId', { sizeId: query.sizeId });
    }

    if (query.brand) {
      queryBuilder.andWhere('g.brand = :brand', {
        brand: query.brand,
      });
    }

    if (query.color) {
      queryBuilder
        .innerJoin('g.colors', 'color')
        .andWhere('color.id = :color', {
          color: query.color,
        });
    }

    if (query.tag) {
      queryBuilder.innerJoin('g.tags', 'tag').andWhere('tag.id = :tag', {
        tag: query.tag,
      });
    }

    if (query.material) {
      queryBuilder.andWhere('g.material = :material', {
        material: query.material,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('g.status = :status', { status: query.status });
    }

    if (query.condition) {
      queryBuilder.andWhere('g.condition = :condition', {
        condition: query.condition,
      });
    }

    if (query.transactionType) {
      queryBuilder.andWhere('g.transaction_type = :transactionType', {
        transactionType: query.transactionType,
      });
    }

    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('g.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('g.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    return queryBuilder
      .orderBy('g.created_at', query.sortOrder)
      .take(query.takeQuantity)
      .getMany();
  }

  async createGarment(dto: CreateGarmentDto): Promise<GarmentEntity> {
    const category = await this.categoriesRepository.findOneBy({
      id: dto.categoryId,
    });
    const waterSaved = category?.waterWaste;

    const user = new UserEntity();

    const garment = this.garmentsRepository.create({
      name: dto.name,
      description: dto.description,
      category: { id: dto.categoryId },
      size: { id: dto.sizeId },
      material: dto.material,
      brand: { id: dto.brandId },
      datePurchased: new Date(dto.datePurchased),
      status: GarmentStatus.AVAILABLE,
      waterSaved: waterSaved,
      condition: dto.condition,
      price: dto.price,
      transactionType: dto.transactionType,
      seller: { id: user.id },
      images: dto.images,
      colors: dto.colorIds?.map((id) => ({ id })),
      care: dto.careId ? { id: dto.careId } : undefined,
      tags: dto.tagIds?.map((id) => ({ id })),
    });

    return this.garmentsRepository.save(garment);
  }

  async findOneGarment(id: string): Promise<GarmentEntity> {
    const garment = await this.garmentsRepository.findOneBy({ id });
    if (!garment) {
      throw new NotFoundException(`Product with id ${id} was not found`);
    }
    return garment;
  }

  async updateGarment(
    id: string,
    dto: UpdateGarmentDto,
  ): Promise<GarmentEntity> {
    const garment = await this.findOneGarment(id);
    this.garmentsRulesService.ensureCanBeUpdated(garment);
    this.garmentsRepository.merge(garment, dto);
    return this.garmentsRepository.save(garment);
  }
}
