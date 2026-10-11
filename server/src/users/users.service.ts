import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

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
}
