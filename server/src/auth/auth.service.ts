import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterStoreDto } from '../stores/dto/register-store.dto';
import { StoreEntity } from '../stores/entities/store.entity';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../common/types/enums';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const email = dto.email.toLowerCase();
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    const user = this.usersRepository.create({
      name: dto.name,
      username: dto.username,
      phone: dto.phone,
      profilePicture: dto.profilePicture ?? null,
      email,
      passwordHash,
      role: UserRoleEnum.USER,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return { id: savedUser.id, email: savedUser.email };
    } catch (error) {
      this.throwIfDuplicateEmail(error);
      throw error;
    }
  }

  async registerStore(dto: RegisterStoreDto) {
    const email = dto.email.toLowerCase();
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      const user = this.usersRepository.create({
        name: dto.name,
        username: dto.username,
        phone: dto.phone,
        profilePicture: dto.profilePicture ?? null,
        email,
        passwordHash,
        role: UserRoleEnum.STORE,
      });

      const savedUser = await this.usersRepository.save(user);
      const store = this.storesRepository.create({
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
      const savedStore = await this.storesRepository.save(store);

      return {
        user: { id: savedUser.id, email: savedUser.email },
        store: {
          id: savedStore.id,
          storeName: savedStore.storeName,
          images: savedStore.images,
        },
      };
    } catch (error) {
      this.throwIfDuplicateEmail(error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await argon2.verify(user.passwordHash, dto.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
    });
    return { access_token: accessToken };
  }

  logout() {
    return {
      message:
        'Logged out successfully. Remove the access token from the client.',
    };
  }

  throwIfDuplicateEmail(error: unknown): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        'Email, username, or phone number already registered',
      );
    }
  }
}
