import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { EventsService } from './events.service';
import { EventEntity } from './entities/event.entity';
import { EventStatusEnum } from '../common/types/enums';

void describe('EventsServiceTest', () => {
  let service: EventsService;

  const eventsRepositoryMock = {
    find: jest.fn<(options: any) => Promise<EventEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<EventEntity | null>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: eventsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all the events', async () => {
    const events = [
      {
        id: '1',
        title: 'Vintage Market',
        description: 'Second-hand fashion event',
        status: EventStatusEnum.UPCOMING,
      },
      {
        id: '2',
        title: 'Clothing Swap',
        description: 'Trade garments with other users',
        status: EventStatusEnum.ONGOING,
      },
    ] as EventEntity[];

    eventsRepositoryMock.find.mockResolvedValue(events);

    const result = await service.findAll({});

    expect(result).toEqual(events);

    expect(eventsRepositoryMock.find).toHaveBeenCalledWith({
      where: {},
      relations: {
        images: true,
        store: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });
  });

  it('returns one event', async () => {
    const eventId = '1';

    const event = {
      id: '1',
      title: 'Vintage Market',
      description: 'Second-hand fashion event',
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    eventsRepositoryMock.findOne.mockResolvedValue(event);

    const result = await service.findOne(eventId);

    expect(result).toEqual(event);

    expect(eventsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: '1',
      },
      relations: {
        images: true,
        store: true,
      },
    });
  });

  it('throws NotFoundException when event does not exist', async () => {
    const eventId = '1';

    eventsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(eventId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
