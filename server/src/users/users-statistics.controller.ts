import { Controller, Get, Req } from '@nestjs/common';
import { UsersStatisticsService } from './users-statistics.service';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('users/me/statistics')
export class UsersStatisticsController {
  constructor(private readonly statisticsService: UsersStatisticsService) {}

  @Get()
  getStatistics(@Req() req: AuthenticatedRequest) {
    return this.statisticsService.getStatistics(req.user.id);
  }
}
