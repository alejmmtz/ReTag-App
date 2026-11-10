import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
  ) {}

  async create(userId: string, dto: CreateStoreDto) {
    const existingStore = await this.storesRepository.findOne({
      where: { userId },
    });

    if (existingStore) {
      throw new ConflictException('User already has a store');
    }

    const store = this.storesRepository.create({
      userId,
      storeName: dto.storeName,
      socialmedia: dto.socialmedia,
      location: dto.location,
      schedule: dto.schedule,
      description: dto.description,

      images: dto.images?.map((image) => ({
        url: image.url,
        isCover: image.isCover ?? false,
        isProfile: image.isProfile ?? false,
      })),
    });

    return this.storesRepository.save(store);
  }

  async findMine(userId: string) {
    const store = await this.storesRepository.findOne({
      where: { userId },
      relations: {
        images: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }
}
