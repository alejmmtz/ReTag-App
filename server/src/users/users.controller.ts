import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthenticatedRequest {
  user: { id: string };
}
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me')
  update(@Req() req: AuthenticatedRequest, @Body() data: UpdateUserDto) {
    return this.usersService.update(req.user.id, data);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
