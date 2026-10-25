import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as argon2 from 'argon2';
import { RegisterStoreDto } from './dto/register-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from './entities/store.entity';
import { UserRoleEnum } from '../common/types/enums';

@Injectable()
export class StoresService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: RegisterStoreDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      return await this.dataSource.transaction(async (manager) => {
        const usersRepository = manager.getRepository(UserEntity);
        const storesRepository = manager.getRepository(StoreEntity);

        const user = usersRepository.create({
          name: dto.name,
          username: dto.username,
          phone: dto.phone,
          profilePicture: dto.profilePicture ?? null,
          email,
          passwordHash,
          role: UserRoleEnum.STORE,
        });
        const savedUser = await usersRepository.save(user);

        const store = storesRepository.create({
          userId: savedUser.id,
          user: savedUser,
          socialmedia: dto.socialmedia,
          storeName: dto.storeName,
          location: dto.location,
          description: dto.description,
          images: dto.images?.map((image, index) => ({
            url: image.url,
            isCover: index === 0,
            isProfile: image.isProfile ?? false,
          })),
        });
        const savedStore = await storesRepository.save(store);

        return {
          user: {
            id: savedUser.id,
            email: savedUser.email,
            username: savedUser.username,
          },
          store: {
            id: savedStore.id,
            storeName: savedStore.storeName,
            images: savedStore.images,
          },
        };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Email, username, or phone number already registered',
        );
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all stores`;
  }

  findOne(id: string) {
    return `This action returns a #${id} store`;
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    return `This action updates a #${id} store`;
  }

  remove(id: string) {
    return `This action removes a #${id} store`;
  }
}
