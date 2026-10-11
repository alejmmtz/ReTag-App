import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { EventsService } from './events.service';
import { EventEntity } from './entities/event.entity';
import {
  EventParticipantStatusEnum,
  EventStatusEnum,
} from '../common/types/enums';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

void describe('EventsServiceTest', () => {
  let service: EventsService;

  const eventsRepositoryMock = {
    find: jest.fn<(options: any) => Promise<EventEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<EventEntity | null>>(),
    create: jest.fn(),
    save: jest.fn<(event: EventEntity) => Promise<EventEntity>>(),
    merge: jest.fn<(event: EventEntity, dto: UpdateEventDto) => EventEntity>(),
    remove: jest.fn<(event: EventEntity) => Promise<EventEntity>>(),
  };

  const storesRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<StoreEntity | null>>(),
  };

  const eventParticipantsRepositoryMock = {
    findOne:
      jest.fn<(options: any) => Promise<EventParticipantEntity | null>>(),
    create: jest.fn(),
    save: jest.fn<
      (participant: EventParticipantEntity) => Promise<EventParticipantEntity>
    >(),
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
        {
          provide: getRepositoryToken(StoreEntity),
          useValue: storesRepositoryMock,
        },
        {
          provide: getRepositoryToken(EventParticipantEntity),
          useValue: eventParticipantsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and saves an event', async () => {
    const userId = '1';

    const data: CreateEventDto = {
      title: 'Vintage Market',
      description: 'Second-hand fashion event',
      startsAt: new Date('2026-11-15T15:00:00.000Z'),
      endsAt: new Date('2026-11-15T20:00:00.000Z'),
      location: 'Cali',
      capacity: 100,
    };

    const store = {
      id: '2',
      userId: '1',
      storeName: 'Vintage Store',
    } as StoreEntity;

    const createdEvent = {
      ...data,
      store,
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    const savedEvent = {
      ...createdEvent,
      id: '3',
    };

    storesRepositoryMock.findOne.mockResolvedValue(store);
    eventsRepositoryMock.create.mockReturnValue(createdEvent);
    eventsRepositoryMock.save.mockResolvedValue(savedEvent);

    const result = await service.create(userId, data);

    expect(result).toEqual(savedEvent);

    expect(storesRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        userId: '1',
      },
    });

    expect(eventsRepositoryMock.create).toHaveBeenCalledWith({
      ...data,
      store,
      status: EventStatusEnum.UPCOMING,
    });

    expect(eventsRepositoryMock.save).toHaveBeenCalledWith(createdEvent);
  });

  it('throws NotFoundException when store does not exist', async () => {
    const userId = '1';

    const data: CreateEventDto = {
      title: 'Vintage Market',
      description: 'Second-hand fashion event',
      startsAt: new Date('2026-11-15T15:00:00.000Z'),
      endsAt: new Date('2026-11-15T20:00:00.000Z'),
    };

    storesRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(userId, data)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and saves an event', async () => {
    const userId = '1';
    const eventId = '3';

    const event = {
      id: '3',
      title: 'Vintage Market',
      description: 'Second-hand fashion event',
      startsAt: new Date('2026-11-15T15:00:00.000Z'),
      endsAt: new Date('2026-11-15T20:00:00.000Z'),
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    const data: UpdateEventDto = {
      location: 'Centro de Eventos Cali',
    };

    eventsRepositoryMock.findOne.mockResolvedValue(event);

    eventsRepositoryMock.merge.mockImplementation(
      (eventToUpdate: EventEntity, updateData: UpdateEventDto) =>
        Object.assign(eventToUpdate, updateData),
    );

    eventsRepositoryMock.save.mockResolvedValue(event);

    const result = await service.update(userId, eventId, data);

    expect(result.location).toBe('Centro de Eventos Cali');

    expect(eventsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: '3',
        store: {
          userId: '1',
        },
      },
      relations: {
        store: true,
      },
    });

    expect(eventsRepositoryMock.merge).toHaveBeenCalledWith(event, data);
    expect(eventsRepositoryMock.save).toHaveBeenCalledWith(event);
  });

  it('removes an event', async () => {
    const userId = '1';
    const eventId = '3';

    const event = {
      id: '3',
      title: 'Vintage Market',
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    eventsRepositoryMock.findOne.mockResolvedValue(event);
    eventsRepositoryMock.remove.mockResolvedValue(event);

    const result = await service.remove(userId, eventId);

    expect(result).toEqual(event);

    expect(eventsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: '3',
        store: {
          userId: '1',
        },
      },
      relations: {
        store: true,
      },
    });

    expect(eventsRepositoryMock.remove).toHaveBeenCalledWith(event);
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

  it('creates an active event participant', async () => {
    const userId = '1';
    const eventId = '2';

    const event = {
      id: '2',
      title: 'Vintage Market',
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    const createdParticipant = {
      userId: '1',
      eventId: '2',
      status: EventParticipantStatusEnum.ACTIVE,
    } as EventParticipantEntity;

    eventsRepositoryMock.findOne.mockResolvedValue(event);
    eventParticipantsRepositoryMock.findOne.mockResolvedValue(null);
    eventParticipantsRepositoryMock.create.mockReturnValue(createdParticipant);
    eventParticipantsRepositoryMock.save.mockResolvedValue(createdParticipant);

    const result = await service.joinEvent(userId, eventId);

    expect(result).toEqual(createdParticipant);

    expect(eventParticipantsRepositoryMock.create).toHaveBeenCalledWith({
      userId: '1',
      eventId: '2',
      status: EventParticipantStatusEnum.ACTIVE,
    });

    expect(eventParticipantsRepositoryMock.save).toHaveBeenCalledWith(
      createdParticipant,
    );
  });

  it('reactivates an existing participant', async () => {
    const userId = '1';
    const eventId = '2';

    const event = {
      id: '2',
      title: 'Vintage Market',
      status: EventStatusEnum.UPCOMING,
    } as EventEntity;

    const participant = {
      userId: '1',
      eventId: '2',
      status: EventParticipantStatusEnum.LEFT,
    } as EventParticipantEntity;

    eventsRepositoryMock.findOne.mockResolvedValue(event);
    eventParticipantsRepositoryMock.findOne.mockResolvedValue(participant);
    eventParticipantsRepositoryMock.save.mockResolvedValue(participant);

    const result = await service.joinEvent(userId, eventId);

    expect(result.status).toBe(EventParticipantStatusEnum.ACTIVE);

    expect(eventParticipantsRepositoryMock.save).toHaveBeenCalledWith(
      participant,
    );
  });

  it('changes participant status to left', async () => {
    const userId = '1';
    const eventId = '2';

    const participant = {
      userId: '1',
      eventId: '2',
      status: EventParticipantStatusEnum.ACTIVE,
    } as EventParticipantEntity;

    eventParticipantsRepositoryMock.findOne.mockResolvedValue(participant);
    eventParticipantsRepositoryMock.save.mockResolvedValue(participant);

    const result = await service.leaveEvent(userId, eventId);

    expect(result.status).toBe(EventParticipantStatusEnum.LEFT);

    expect(eventParticipantsRepositoryMock.save).toHaveBeenCalledWith(
      participant,
    );
  });

  it('throws NotFoundException when participation does not exist', async () => {
    const userId = '1';
    const eventId = '2';

    eventParticipantsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.leaveEvent(userId, eventId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when user is not an active participant', async () => {
    const userId = '1';
    const eventId = '2';

    eventParticipantsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.ensureActiveParticipant(userId, eventId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
