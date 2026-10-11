import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll() {
    return `This action returns all users`;
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
 

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    this.usersRepository.merge(user, updateUserDto);

    return this.usersRepository.save(user);
  }
}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
