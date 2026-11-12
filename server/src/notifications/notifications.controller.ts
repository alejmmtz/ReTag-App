import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../users/dto/pagination-query.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { UserRoleEnum } from '../common/types/enums';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER, UserRoleEnum.STORE)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query(requestValidationPipe) query: PaginationQueryDto,
  ) {
    return this.notificationsService.findAll(req.user.id, query);
  }
}
