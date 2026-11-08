import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { Repository } from 'typeorm';
import { FilterGarmentsQueryDto } from './dto/filter-garments-query.dto';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { GarmentStatus } from '../common/types/enums';
import { GarmentRulesService } from './garment-rules.service';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { CatalogsService } from '../catalogs/catalogs.service';
import { ColorEntity } from '../catalogs/entities/color.entity';
import { TagEntity } from '../catalogs/entities/tag.entity';
import { GarmentImageEntity } from './entities/garment-image.entity';
import { EventEntity } from '../events/entities/event.entity';
import { GarmentImagesService } from './garment-images.service';

@Injectable()
export class GarmentsService {
  constructor(
    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,

    @InjectRepository(GarmentImageEntity)
    private readonly garmentImagesRepository: Repository<GarmentImageEntity>,

    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,

    private readonly garmentsRulesService: GarmentRulesService,

    private readonly catalogService: CatalogsService,

    private readonly garmentImagesService: GarmentImagesService,
  ) {}

  async findAllGarments(
    query: FilterGarmentsQueryDto,
  ): Promise<GarmentEntity[]> {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException('minPrice cannot exceed maxPrice');
    }

    const queryBuilder = this.garmentsRepository.createQueryBuilder('g');
    queryBuilder.leftJoinAndSelect('g.images', 'image');

    if (query.name) {
      queryBuilder.andWhere('g.name ILIKE :name', { name: `%${query.name}%` });
    }

    if (query.sizeId) {
      queryBuilder.andWhere('g.size_id = :sizeId', { sizeId: query.sizeId });
    }

    if (query.brand) {
      queryBuilder.andWhere('g.brand_id = :brandId', {
        brandId: query.brand,
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

    queryBuilder.andWhere('g.status = :status', {
      status: query.status ?? GarmentStatus.AVAILABLE,
    });

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
      .addOrderBy('image.is_cover', 'DESC')
      .addOrderBy('image.id', 'ASC')
      .skip(query.skipQuantity)
      .take(query.takeQuantity)
      .getMany();
  }

  async createGarment(
    userId: string,
    dto: CreateGarmentDto,
  ): Promise<GarmentEntity> {
    const [category, brand, size, care, event, colors, tags] =
      await this.catalogPromises(dto);

    if (category == null || brand == null || size == null) {
      throw new NotFoundException();
    }

    const garment = this.garmentsRepository.create({
      name: dto.name,
      description: dto.description,
      category: { id: category.id },
      size: { id: size.id },
      material: dto.material,
      brand: { id: brand.id },
      datePurchased: new Date(dto.datePurchased),
      status: GarmentStatus.AVAILABLE,
      waterSaved: category.waterWaste,
      condition: dto.condition,
      price: dto.price,
      transactionType: dto.transactionType,
      seller: { id: userId },
      event: event ? { id: event.id } : undefined,
      colors: colors.map((color: ColorEntity) => ({ id: color.id })),
      tags: tags.map((tag: TagEntity) => ({ id: tag.id })),
      care: care?.id ? { id: care.id } : undefined,
    });

    const savedGarment = await this.garmentsRepository.save(garment);

    if (dto.images?.length) {
      const images = this.garmentImagesService.toGarmentImages(
        dto.images,
        savedGarment.id,
      );
      await this.garmentImagesRepository.save(images);
    }

    return this.findOneGarment(savedGarment.id);
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
      order: { images: { isCover: 'DESC', id: 'ASC' } },
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

    const [category, brand, size, care, event, colors, tags] =
      await this.catalogPromises(dto);

    const changes = this.garmentsRepository.create({
      name: dto.name,
      description: dto.description,
      category: category ? { id: category.id } : undefined,
      size: size ? { id: size.id } : undefined,
      material: dto.material,
      brand: brand ? { id: brand.id } : undefined,
      datePurchased: dto.datePurchased
        ? new Date(dto.datePurchased)
        : undefined,
      waterSaved: category?.waterWaste,
      condition: dto.condition,
      price: dto.price,
      event: event ? { id: event.id } : undefined,
      transactionType: dto.transactionType,
      care: care ? { id: care.id } : undefined,
      colors:
        dto.colorIds != null
          ? colors.map((color: ColorEntity) => ({ id: color.id }))
          : undefined,
      tags:
        dto.tagIds != null
          ? tags.map((tag: TagEntity) => ({ id: tag.id }))
          : undefined,
    });

    if (dto.eventId === null) {
      changes.event = null;
    }

    const images =
      dto.images != null && dto.images.length > 0
        ? this.garmentImagesService.toGarmentImages(dto.images, garment.id)
        : [];

    this.garmentsRepository.merge(garment, changes);
    await this.garmentsRepository.save(garment);

    if (dto.images != null) {
      await this.garmentImagesRepository
        .createQueryBuilder()
        .delete()
        .where('garment_id = :garmentId', { garmentId: garment.id })
        .execute();

      if (images.length > 0) {
        await this.garmentImagesRepository.save(images);
      }
    }

    return this.findOneGarment(id);
  }

  async removeGarment(id: string, userId: string) {
    const garment = await this.findOwnedGarment(id, userId);
    this.garmentsRulesService.ensureCanBeDeleted(garment);
    await this.garmentsRepository.remove(garment);
  }

  private async findOwnedGarment(
    id: string,
    userId: string,
  ): Promise<GarmentEntity> {
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

  private async findEvent(id: string): Promise<EventEntity> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} was not found`);
    }
    return event;
  }

  private async catalogPromises(dto: CreateGarmentDto | UpdateGarmentDto) {
    return Promise.all([
      dto.categoryId
        ? this.catalogService.findCatalogCategory(dto.categoryId)
        : Promise.resolve(null),
      dto.brandId
        ? this.catalogService.findCatalogBrand(dto.brandId)
        : Promise.resolve(null),
      dto.sizeId
        ? this.catalogService.findCatalogSize(dto.sizeId)
        : Promise.resolve(null),
      dto.careId
        ? this.catalogService.findCatalogCare(dto.careId)
        : Promise.resolve(null),
      dto.eventId ? this.findEvent(dto.eventId) : Promise.resolve(null),
      dto.colorIds != null
        ? this.catalogService.findCatalogColors(dto.colorIds)
        : Promise.resolve([]),
      dto.tagIds != null
        ? this.catalogService.findCatalogTags(dto.tagIds)
        : Promise.resolve([]),
    ]);
  }
}
