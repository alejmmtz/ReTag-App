import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventEntity } from './entities/event.entity';
import { FilterEventsQueryDto } from './dto/filter-events-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
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
}
