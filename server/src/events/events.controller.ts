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
  UseGuards,
} from '@nestjs/common';

import { EventsService } from './events.service';
import { FilterEventsQueryDto } from './dto/filter-events-query.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

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
  @UseGuards(JwtAuthGuard)
  joinEvent(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) eventId: string,
  ) {
    const userId = request.user.id;

    return this.eventsService.joinEvent(userId, eventId);
  }

  @Patch(':id/leave')
  @UseGuards(JwtAuthGuard)
  leaveEvent(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) eventId: string,
  ) {
    const userId = request.user.id;

    return this.eventsService.leaveEvent(userId, eventId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreateEventDto,
  ) {
    const userId = request.user.id;

    return this.eventsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateEventDto,
  ) {
    const userId = request.user.id;

    return this.eventsService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = request.user.id;

    return this.eventsService.remove(userId, id);
  }
}
