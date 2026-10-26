import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { FilterGarmentsQueryDto } from './dto/filter-garments-query.dto';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { GarmentStatus } from '../common/types/enums';
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

  async createGarment(
    userId: string,
    dto: CreateGarmentDto,
  ): Promise<GarmentEntity> {
    const category = await this.categoriesRepository.findOneBy({
      id: dto.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Category with id ${dto.categoryId} was not found`,
      );
    }

    const garment = this.garmentsRepository.create({
      name: dto.name,
      description: dto.description,
      category: { id: dto.categoryId },
      size: { id: dto.sizeId },
      material: dto.material,
      brand: { id: dto.brandId },
      datePurchased: new Date(dto.datePurchased),
      status: GarmentStatus.AVAILABLE,
      waterSaved: category.waterWaste,
      condition: dto.condition,
      price: dto.price,
      transactionType: dto.transactionType,
      seller: { id: userId },
      event: dto.eventId ? { id: dto.eventId } : undefined,
      images: dto.images?.map((image, index) => ({
        url: image.url,
        isCover: index === 0,
      })),
      colors: dto.colorIds?.map((id) => ({ id })),
      care: dto.careId ? { id: dto.careId } : undefined,
      tags: dto.tagIds?.map((id) => ({ id })),
    });

    return this.garmentsRepository.save(garment);
  }

  async findOneGarment(id: string): Promise<GarmentEntity> {
    const garment = await this.garmentsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        size: true,
        brand: true,
        event: true,
        bag: true,
        seller: true,
        images: true,
        posts: true,
        colors: true,
        care: true,
        tags: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        material: true,
        datePurchased: true,
        status: true,
        waterSaved: true,
        condition: true,
        price: true,
        transactionType: true,
        createdAt: true,
        category: { id: true, name: true, waterWaste: true },
        size: { id: true, type: true, label: true },
        brand: { id: true, name: true, logo: true, description: true },
        event: {
          id: true,
          title: true,
          description: true,
          status: true,
          startsAt: true,
          endsAt: true,
          location: true,
          capacity: true,
          createdAt: true,
        },
        bag: { userId: true, garmentId: true, createdAt: true },
        seller: {
          id: true,
          name: true,
          username: true,
          profilePicture: true,
          role: true,
          description: true,
        },
        images: { id: true, url: true, isCover: true },
        posts: { id: true, caption: true, postType: true, createdAt: true },
        colors: { id: true, name: true, hexcode: true },
        care: { id: true, name: true, icon: true, type: true },
        tags: { id: true, name: true },
      },
    });
    if (!garment) {
      throw new NotFoundException(`Product with id ${id} was not found`);
    }
    return garment;
  }

  async updateGarment(
    id: string,
    userId: string,
    dto: UpdateGarmentDto,
  ): Promise<GarmentEntity> {
    const garment = await this.findOwnedGarment(id, userId);
    this.garmentsRulesService.ensureCanBeUpdated(garment);

    let category: CategoryEntity | null | undefined;
    if (dto.categoryId !== undefined) {
      category = await this.categoriesRepository.findOneBy({
        id: dto.categoryId,
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${dto.categoryId} was not found`,
        );
      }
    }

    const changes = this.garmentsRepository.create({
      name: dto.name,
      description: dto.description,
      category: category ? { id: category.id } : undefined,
      size: dto.sizeId ? { id: dto.sizeId } : undefined,
      material: dto.material,
      brand: dto.brandId ? { id: dto.brandId } : undefined,
      datePurchased: dto.datePurchased
        ? new Date(dto.datePurchased)
        : undefined,
      waterSaved: category?.waterWaste,
      condition: dto.condition,
      price: dto.price,
      event: dto.eventId ? { id: dto.eventId } : undefined,
      colors: dto.colorIds?.map((colorId) => ({ id: colorId })),
      care: dto.careId ? { id: dto.careId } : undefined,
      tags: dto.tagIds?.map((tagId) => ({ id: tagId })),
      images: dto.images?.map((image, index) => ({
        url: image.url,
        isCover: index === 0,
      })),
    });

    this.garmentsRepository.merge(garment, changes);

    if (dto.images !== undefined) {
      garment.images = changes.images ?? [];
    }
    if (dto.colorIds !== undefined) {
      garment.colors = changes.colors ?? [];
    }
    if (dto.tagIds !== undefined) {
      garment.tags = changes.tags ?? [];
    }

    return this.garmentsRepository.save(garment);
  }

  async removeGarment(id: string, userId: string) {
    const garment = await this.findOwnedGarment(id, userId);
    this.garmentsRulesService.ensureCanBeDeleted(garment);

    try {
      await this.garmentsRepository.remove(garment);
      return { id: garment.id, message: 'Garment deleted permanently' };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23503'
      ) {
        throw new ConflictException(
          'This garment is linked to a post or transaction and cannot be deleted',
        );
      }
      throw error;
    }
  }

  private async findOwnedGarment(id: string, userId: string) {
    const garment = await this.garmentsRepository.findOne({
      where: { id, seller: { id: userId } },
      relations: { seller: true },
    });

    if (!garment) {
      throw new NotFoundException(
        `Garment with id ${id} was not found in your closet`,
      );
    }

    return garment;
  }
}
