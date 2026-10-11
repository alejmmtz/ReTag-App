import {
  Body,
  Controller,
  Delete,
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
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
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

  @Post()
  create(
    @Req() request: any,
    @Body(requestValidationPipe) dto: CreateEventDto,
  ) {
    const userId = request.user.id;

    return this.eventsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Req() request: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateEventDto,
  ) {
    const userId = request.user.id;

    return this.eventsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() request: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = request.user.id;

    return this.eventsService.remove(userId, id);
  }
}
