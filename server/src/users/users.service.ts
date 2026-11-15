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
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { paginate } from '../common/utils/paginate';
import { FollowEntity } from './entities/follow.entity';
import { GarmentsService } from '../garments/garments.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followsRepository: Repository<FollowEntity>,

    private readonly garmentsService: GarmentsService,
    private readonly postsService: PostsService,
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

  async search(query: SearchUsersQueryDto) {
    const { page, limit, q } = query;
    // Escapa % y _ para que el texto del usuario no actúe como comodín.
    const term = `%${q.trim().replace(/[\\%_]/g, '\\$&')}%`;

    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.store', 'store')
      .select([
        'user.id',
        'user.name',
        'user.username',
        'user.profilePicture',
        'user.role',
        'store.storeName',
      ])
      .where(
        '(user.username ILIKE :term OR user.name ILIKE :term OR store.storeName ILIKE :term)',
        { term },
      )
      .orderBy('user.username', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(
      users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.store?.storeName ?? user.name,
        profilePicture: user.profilePicture,
        role: user.role,
      })),
      total,
      page,
      limit,
    );
  }

  async findGarments(userId: string, query: FilterUserGarmentsQueryDto) {
    await this.ensureUserExists(userId);
    return this.garmentsService.findBySeller(userId, query);
  }

  async findPosts(userId: string, query: PaginationQueryDto) {
    await this.ensureUserExists(userId);
    return this.postsService.findByUser(userId, query);
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
