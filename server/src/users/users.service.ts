import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserGarmentsQueryDto } from './dto/filter-user-garments-query.dto';
import { GarmentStatus } from '../common/types/enums';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { paginate } from '../common/utils/paginate';
import { FollowEntity } from './entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,

    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,

    @InjectRepository(FollowEntity)
    private readonly followsRepository: Repository<FollowEntity>,
  ) {}

  private async ensureUserExists(id: string) {
    const exists = await this.usersRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        profilePicture: true,
        description: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (data.username && data.username !== user.username) {
      const taken = await this.usersRepository.findOne({
        where: { username: data.username },
      });
      if (taken) {
        throw new ConflictException('Username is already in use');
      }
    }

    if (data.phone && data.phone !== user.phone) {
      const taken = await this.usersRepository.findOne({
        where: { phone: data.phone },
      });
      if (taken) {
        throw new ConflictException('Phone is already in use');
      }
    }

    Object.assign(user, data);
    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      name: saved.name,
      username: saved.username,
      email: saved.email,
      phone: saved.phone,
      profilePicture: saved.profilePicture,
      description: saved.description,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }

  async findGarments(userId: string, query: FilterUserGarmentsQueryDto) {
    await this.ensureUserExists(userId);

    const { page, limit, status = GarmentStatus.AVAILABLE } = query;

    const [garments, total] = await this.garmentsRepository.findAndCount({
      where: {
        seller: { id: userId },
        status,
      },
      relations: {
        images: true,
        brand: true,
        size: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(garments, total, page, limit);
  }

  async findPosts(userId: string, query: PaginationQueryDto) {
    await this.ensureUserExists(userId);

    const { page, limit } = query;

    const [posts, total] = await this.postsRepository.findAndCount({
      where: {
        userId: { id: userId },
      },
      relations: {
        images: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(posts, total, page, limit);
  }

  async follow(followerId: string, followedId: string) {
    if (followerId === followedId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    await this.ensureUserExists(followedId);

    const existingFollow = await this.followsRepository.findOne({
      where: { followerId, followedId },
    });

    if (existingFollow) {
      throw new ConflictException('You already follow this user');
    }

    const follow = this.followsRepository.create({ followerId, followedId });

    return this.followsRepository.save(follow);
  }

  async unfollow(followerId: string, followedId: string) {
    const follow = await this.followsRepository.findOne({
      where: { followerId, followedId },
    });

    if (!follow) {
      throw new NotFoundException('Follow relation not found');
    }

    await this.followsRepository.remove(follow);

    return { message: 'User unfollowed successfully' };
  }
}
