import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from './entities/store.entity';
import { StoreImage } from './entities/store-image.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginationResponse } from '../common/utils/pagination-response';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../common/types/enums';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
    @InjectRepository(StoreImage)
    private readonly storeImagesRepository: Repository<StoreImage>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(userId: string, createStoreDto: CreateStoreDto) {
    const existing = await this.storesRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('This user already has a store.');
    }

    const store = this.storesRepository.create({
      userId,
      storeName: createStoreDto.storeName,
      socialmedia: createStoreDto.socialmedia,
      schedule: createStoreDto.schedule,
      location: createStoreDto.location,
      description: createStoreDto.description,
    });

    if (createStoreDto.images?.length) {
      store.images = createStoreDto.images.map((image) =>
        this.storeImagesRepository.create({
          url: image.url,
          isCover: image.isCover ?? false,
          isProfile: image.isProfile ?? false,
        }),
      );
    }

    try {
      const saved = await this.storesRepository.save(store);

      // Promote the user role to STORE so guards work on subsequent requests.
      await this.usersRepository.update(userId, { role: UserRoleEnum.STORE });

      return { id: saved.id };
    } catch (error) {
      if (
        error instanceof Error &&
        'driverError' in error &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Store data conflicts with an existing record',
        );
      }
      throw error;
    }
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit } = query;
    const [stores, total] = await this.storesRepository.findAndCount({
      relations: { user: true, images: true },
      select: {
        id: true,
        socialmedia: true,
        storeName: true,
        location: true,
        description: true,
        user: {
          id: true,
          username: true,
          profilePicture: true,
        },
        images: { id: true, url: true, isCover: true, isProfile: true },
      },
      order: { storeName: 'ASC', images: { isCover: 'DESC', id: 'ASC' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResponse(stores, total, limit, (page - 1) * limit);
  }

  async findOne(id: string) {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: { user: true, images: true },
      select: {
        id: true,
        socialmedia: true,
        storeName: true,
        location: true,
        description: true,
        user: {
          id: true,
          username: true,
          profilePicture: true,
        },
        images: { id: true, url: true, isCover: true, isProfile: true },
      },
      order: { images: { isCover: 'DESC', id: 'ASC' } },
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    return store;
  }

  // Tienda de un usuario (para el perfil propio y para ver la tienda de otro)
  async findByUser(userId: string) {
    const store = await this.storesRepository.findOne({
      where: { userId },
      relations: { user: true, images: true },
      select: {
        id: true,
        socialmedia: true,
        storeName: true,
        schedule: true,
        location: true,
        description: true,
        user: {
          id: true,
          username: true,
          profilePicture: true,
        },
        images: { id: true, url: true, isCover: true, isProfile: true },
      },
      order: { images: { isCover: 'DESC', id: 'ASC' } },
    });

    if (!store) {
      throw new NotFoundException(`Store for user ${userId} not found`);
    }

    return store;
  }

  async update(userId: string, id: string, updateStoreDto: UpdateStoreDto) {
    const store = await this.storesRepository.findOne({
      where: { id, userId },
      relations: { images: true },
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    Object.assign(store, {
      socialmedia: updateStoreDto.socialmedia,
      storeName: updateStoreDto.storeName,
      schedule: updateStoreDto.schedule,
      location: updateStoreDto.location,
      description: updateStoreDto.description,
    });

    if (updateStoreDto.images !== undefined) {
      await this.storeImagesRepository.remove(store.images ?? []);
      store.images = updateStoreDto.images.map((image, index) =>
        this.storeImagesRepository.create({
          url: image.url,
          isCover: index === 0,
          isProfile: image.isProfile ?? false,
          store,
        }),
      );
    }

    try {
      await this.storesRepository.save(store);
    } catch (error) {
      if (
        error instanceof Error &&
        'driverError' in error &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Store data conflicts with an existing record',
        );
      }
      throw error;
    }

    return this.findOne(id);
  }

  async remove(userId: string, id: string) {
    const store = await this.storesRepository.findOne({
      where: { id, userId },
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    await this.storesRepository.remove(store);
    return { message: 'Store deleted successfully' };
  }
}
