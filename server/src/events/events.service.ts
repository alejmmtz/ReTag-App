import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { EventParticipantStatusEnum } from '../common/types/enums';
import { EventEntity } from './entities/event.entity';
import { FilterEventsQueryDto } from './dto/filter-events-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,

    @InjectRepository(EventParticipantEntity)
    private readonly eventParticipantsRepository: Repository<EventParticipantEntity>,
  ) {}

  async findAll(query: FilterEventsQueryDto) {
    return this.eventsRepository.find({
      where: {
        ...(query.status && { status: query.status }),
      },
      relations: {
        images: true,
        store: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({
      where: {
        id,
      },
      relations: {
        images: true,
        store: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async joinEvent(userId: string, eventId: string) {
    await this.findOne(eventId);

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
}
