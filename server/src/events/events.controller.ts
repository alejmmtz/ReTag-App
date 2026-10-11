import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { EventsService } from './events.service';
import { FilterEventsQueryDto } from './dto/filter-events-query.dto';
import { requestValidationPipe } from '../common/pipes/pipes';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query(requestValidationPipe) query: FilterEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }
}
