import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BagEntity } from './entities/bag.entity';
import { CreateBagDto } from './dto/create-bag.dto';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { GarmentStatus } from '../common/types/enums';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginationResponse } from '../common/utils/pagination-response';

@Injectable()
export class BagsService {
  constructor(
    @InjectRepository(BagEntity)
    private readonly bagsRepository: Repository<BagEntity>,

    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,
  ) {}

  // Guarda una prenda en la bolsa del usuario.
  async create(userId: string, dto: CreateBagDto) {
    const garment = await this.garmentsRepository.findOne({
      where: { id: dto.garmentId },
      relations: { seller: true },
    });

    if (!garment) {
      throw new NotFoundException(`Garment with id ${dto.garmentId} not found`);
    }

    if (garment.seller.id === userId) {
      throw new BadRequestException('You cannot add your own garment');
    }

    if (garment.status !== GarmentStatus.AVAILABLE) {
      throw new BadRequestException('This garment is no longer available');
    }

    const exists = await this.bagsRepository.exists({
      where: { userId, garmentId: dto.garmentId },
    });

    if (exists) {
      throw new ConflictException('This garment is already in your bag');
    }

    const saved = await this.bagsRepository.save(
      this.bagsRepository.create({ userId, garmentId: dto.garmentId }),
    );

    return { garmentId: saved.garmentId, createdAt: saved.createdAt };
  }

  // Prendas de la bolsa del usuario, las más recientes primero.
  async findAll(userId: string, query: PaginationQueryDto) {
    const { page, limit } = query;

    const [items, total] = await this.bagsRepository.findAndCount({
      where: { userId },
      relations: {
        garment: {
          images: true,
          brand: true,
          size: true,
          seller: true,
        },
      },
      order: { createdAt: 'DESC', garment: { images: { isCover: 'DESC' } } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResponse(
      items.map((item) => ({
        addedAt: item.createdAt,
        garment: {
          id: item.garment.id,
          name: item.garment.name,
          price: item.garment.price,
          transactionType: item.garment.transactionType,
          status: item.garment.status,
          brand: item.garment.brand
            ? { id: item.garment.brand.id, name: item.garment.brand.name }
            : null,
          size: item.garment.size
            ? { id: item.garment.size.id, label: item.garment.size.label }
            : null,
          seller: {
            id: item.garment.seller.id,
            username: item.garment.seller.username,
          },
          images: (item.garment.images ?? []).map((image) => ({
            id: image.id,
            url: image.url,
            isCover: image.isCover,
          })),
        },
      })),
      total,
      limit,
      (page - 1) * limit,
    );
  }

  // Sirve para saber si una prenda ya está en la bolsa (404 si no).
  async findOne(userId: string, garmentId: string) {
    const item = await this.bagsRepository.findOne({
      where: { userId, garmentId },
    });

    if (!item) {
      throw new NotFoundException('This garment is not in your bag');
    }

    return { garmentId: item.garmentId, addedAt: item.createdAt };
  }

  async remove(userId: string, garmentId: string) {
    const item = await this.bagsRepository.findOne({
      where: { userId, garmentId },
    });

    if (!item) {
      throw new NotFoundException('This garment is not in your bag');
    }

    await this.bagsRepository.remove(item);

    return { message: 'Garment removed from your bag' };
  }
}
