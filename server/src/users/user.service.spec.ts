import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { FilterUserGarmentsQueryDto } from './dto/filter-user-garments-query.dto';
import { GarmentStatus } from '../common/types/enums';

void describe('UsersServiceTest', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<UserEntity | null>>(),
    save: jest.fn<(user: UserEntity) => Promise<UserEntity>>(),
    exists: jest.fn<(options: any) => Promise<boolean>>(),
  };

  const garmentsRepositoryMock = {
    findAndCount:
      jest.fn<(options: any) => Promise<[GarmentEntity[], number]>>(),
  };

  const postsRepositoryMock = {
    findAndCount: jest.fn<(options: any) => Promise<[PostEntity[], number]>>(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usersRepositoryMock,
        },
        {
          provide: getRepositoryToken(GarmentEntity),
          useValue: garmentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(PostEntity),
          useValue: postsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });
  //R18
  it('returns the public profile of a user', async () => {
    const userMock = {
      id: '1',
      name: 'Natalia',
      username: 'NataBacana',
      profilePicture: 'photo.jpg',
      description: 'Vendo ropa vintage',
    } as UserEntity;

    usersRepositoryMock.findOne.mockResolvedValue(userMock);

    const result = await service.findOne('1');

    expect(result).toEqual(userMock);
    expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
  });

  it('throws NotFoundException when the profile does not exist', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and saves the profile of the user', async () => {
    const userMock = {
      id: '1',
      name: 'Jorge',
      username: 'jorge',
      email: 'jorge@gmail.com',
      phone: '3734284289',
      password: 'hashed',
      profilePicture: 'old.jpg',
      description: 'old',
    } as UserEntity;

    const data: UpdateUserDto = {
      name: 'Jorge Nuevo',
      description: 'Nueva descripción',
      profilePicture: 'new.jpg',
    };

    usersRepositoryMock.findOne.mockResolvedValue(userMock);
    usersRepositoryMock.save.mockImplementation((user) =>
      Promise.resolve(user),
    );

    const result = await service.update('1', data);

    expect(usersRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'Jorge Nuevo',
        description: 'Nueva descripción',
        profilePicture: 'new.jpg',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({ id: '1', name: 'Jorge Nuevo' }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('throws NotFoundException when updating a user that does not exist', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.update('1', { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when username is already in use', async () => {
    const userMock = { id: '1', username: 'jorge' } as UserEntity;
    const otherUser = { id: '2', username: 'alejo' } as UserEntity;

    usersRepositoryMock.findOne
      .mockResolvedValueOnce(userMock)
      .mockResolvedValueOnce(otherUser);

    await expect(
      service.update('1', { username: 'alejo' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when phone is already in use', async () => {
    const userMock = { id: '1', phone: '300' } as UserEntity;
    const otherUser = { id: '2', phone: '311' } as UserEntity;

    usersRepositoryMock.findOne
      .mockResolvedValueOnce(userMock)
      .mockResolvedValueOnce(otherUser);

    await expect(service.update('1', { phone: '311' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });

  //R19
  it('returns the first page of available garments by default', async () => {
    const garmentMock = { id: 'g1' } as GarmentEntity;

    usersRepositoryMock.exists.mockResolvedValue(true);
    garmentsRepositoryMock.findAndCount.mockResolvedValue([[garmentMock], 1]);

    const result = await service.findGarments(
      '1',
      new FilterUserGarmentsQueryDto(),
    );

    expect(result).toEqual({
      data: [garmentMock],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    expect(garmentsRepositoryMock.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seller: { id: '1' }, status: GarmentStatus.AVAILABLE },
        skip: 0,
        take: 10,
      }),
    );
  });

  it('applies status filter and pagination to the closet', async () => {
    const query = Object.assign(new FilterUserGarmentsQueryDto(), {
      page: 2,
      limit: 5,
      status: GarmentStatus.PURCHASED,
    });

    usersRepositoryMock.exists.mockResolvedValue(true);
    garmentsRepositoryMock.findAndCount.mockResolvedValue([[], 7]);

    const result = await service.findGarments('1', query);

    expect(result.meta).toEqual({ page: 2, limit: 5, total: 7, totalPages: 2 });
    expect(garmentsRepositoryMock.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seller: { id: '1' }, status: GarmentStatus.PURCHASED },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('throws NotFoundException when the closet owner does not exist', async () => {
    usersRepositoryMock.exists.mockResolvedValue(false);

    await expect(
      service.findGarments('1', new FilterUserGarmentsQueryDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(garmentsRepositoryMock.findAndCount).not.toHaveBeenCalled();
  });

  it('returns the posts of a user paginated', async () => {
    const postMock = { id: 'p1' } as PostEntity;

    usersRepositoryMock.exists.mockResolvedValue(true);
    postsRepositoryMock.findAndCount.mockResolvedValue([[postMock], 1]);

    const result = await service.findPosts('1', new PaginationQueryDto());

    expect(result).toEqual({
      data: [postMock],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    expect(postsRepositoryMock.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: { id: '1' } },
        skip: 0,
        take: 10,
      }),
    );
  });

  it('throws NotFoundException when the posts owner does not exist', async () => {
    usersRepositoryMock.exists.mockResolvedValue(false);

    await expect(
      service.findPosts('1', new PaginationQueryDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(postsRepositoryMock.findAndCount).not.toHaveBeenCalled();
  });
});
