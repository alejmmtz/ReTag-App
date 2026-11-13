import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventParticipantEntity } from './entities/event-participant.entity';
import {
  EventParticipantStatusEnum,
  EventStatusEnum,
} from '../common/types/enums';
import { EventEntity } from './entities/event.entity';
import { FilterEventsQueryDto } from './dto/filter-events-query.dto';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,

    @InjectRepository(EventParticipantEntity)
    private readonly eventParticipantsRepository: Repository<EventParticipantEntity>,

    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
  ) {}

  async create(userId: string, dto: CreateEventDto) {
    const store = await this.storesRepository.findOne({
      where: {
        userId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (dto.endsAt.getTime() <= dto.startsAt.getTime()) {
      throw new BadRequestException(
        'The event end date must be after the start date',
      );
    }

    const event = this.eventsRepository.create({
      title: dto.title,
      description: dto.description,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      location: dto.location,
      capacity: dto.capacity,
      store,
      status: EventStatusEnum.UPCOMING,
    });

    return this.eventsRepository.save(event);
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    const event = await this.eventsRepository.findOne({
      where: {
        id,
        store: {
          userId,
        },
      },
      relations: {
        store: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const startsAt = dto.startsAt ?? event.startsAt;
    const endsAt = dto.endsAt ?? event.endsAt;

    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new BadRequestException(
        'The event end date must be after the start date',
      );
    }

    this.eventsRepository.merge(event, dto);

    return this.eventsRepository.save(event);
  }

  async remove(userId: string, id: string) {
    const event = await this.eventsRepository.findOne({
      where: {
        id,
        store: {
          userId,
        },
      },
      relations: {
        store: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.eventsRepository.remove(event);
  }

  async findAll(query: FilterEventsQueryDto) {
    const events = await this.eventsRepository.find({
      where: {
        ...(query.status && {
          status: query.status,
        }),
      },
      relations: {
        store: {
          images: true,
        },
      },
      order: {
        startsAt: 'ASC',
      },
    });

    return Promise.all(
      events.map(async (event) => {
        const participantsCount = await this.eventParticipantsRepository.count({
          where: {
            eventId: event.id,
            status: EventParticipantStatusEnum.ACTIVE,
          },
        });

        return {
          ...event,
          participantsCount,
        };
      }),
    );
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({
      where: {
        id,
      },
      relations: {
        store: {
          images: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const participantsCount = await this.eventParticipantsRepository.count({
      where: {
        eventId: id,
        status: EventParticipantStatusEnum.ACTIVE,
      },
    });

    return {
      ...event,
      participantsCount,
    };
  }

  async joinEvent(userId: string, eventId: string) {
    const event = await this.findOne(eventId);

    if (event.capacity) {
      const participantsCount = await this.eventParticipantsRepository.count({
        where: {
          eventId,
          status: EventParticipantStatusEnum.ACTIVE,
        },
      });

      if (participantsCount >= event.capacity) {
        throw new BadRequestException('Event capacity has been reached');
      }
    }

    const existingParticipant = await this.eventParticipantsRepository.findOne({
      where: {
        eventId,
        userId,
      },
    });

    if (existingParticipant) {
      existingParticipant.status = EventParticipantStatusEnum.ACTIVE;

      return this.eventParticipantsRepository.save(existingParticipant);
    }

    const participant = this.eventParticipantsRepository.create({
      eventId,
      userId,
      status: EventParticipantStatusEnum.ACTIVE,
    });

    return this.eventParticipantsRepository.save(participant);
  }

  async leaveEvent(userId: string, eventId: string) {
    const participant = await this.eventParticipantsRepository.findOne({
      where: {
        eventId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Event participation not found');
    }

    participant.status = EventParticipantStatusEnum.LEFT;

    return this.eventParticipantsRepository.save(participant);
  }

  async ensureActiveParticipant(userId: string, eventId: string) {
    const participant = await this.eventParticipantsRepository.findOne({
      where: {
        eventId,
        userId,
        status: EventParticipantStatusEnum.ACTIVE,
      },
    });

    if (!participant) {
      throw new BadRequestException(
        'You must be an active participant of this event',
      );
    }

    return participant;
  }

  async getParticipation(userId: string, eventId: string) {
    const participant = await this.eventParticipantsRepository.findOne({
      where: {
        userId,
        eventId,
      },
    });

    return {
      joined: participant?.status === EventParticipantStatusEnum.ACTIVE,
    };
  }

  async findMine(userId: string) {
    const events = await this.eventsRepository.find({
      where: {
        store: {
          userId,
        },
      },
      relations: {
        store: {
          images: true,
        },
      },
      order: {
        startsAt: 'ASC',
      },
    });

    return Promise.all(
      events.map(async (event) => {
        const participantsCount = await this.eventParticipantsRepository.count({
          where: {
            eventId: event.id,
            status: EventParticipantStatusEnum.ACTIVE,
          },
        });

        return {
          ...event,
          participantsCount,
        };
      }),
    );
  }
}
