import { Controller, Get, Query, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../users/dto/pagination-query.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query(requestValidationPipe) query: PaginationQueryDto,
  ) {
    return this.notificationsService.findAll(req.user.id, query);
  }
}
