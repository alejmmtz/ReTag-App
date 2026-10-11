import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

void describe('UsersServiceTest', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<UserEntity | null>>(),
    save: jest.fn<(user: UserEntity) => Promise<UserEntity>>(),
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
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

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
});
