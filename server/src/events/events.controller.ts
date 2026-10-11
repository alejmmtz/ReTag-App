import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

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

  @Post(':id/join')
  joinEvent(@Req() request: any, @Param('id', ParseUUIDPipe) eventId: string) {
    // TODO: Protect route with authentication guard once auth is implemented
    const userId = request.user.id;

    return this.eventsService.joinEvent(userId, eventId);
  }

  @Patch(':id/leave')
  leaveEvent(@Req() request: any, @Param('id', ParseUUIDPipe) eventId: string) {
    const userId = request.user.id;

    return this.eventsService.leaveEvent(userId, eventId);
  }
}
