import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BagsService } from './bags.service';
import { CreateBagDto } from './dto/create-bag.dto';
import { UpdateBagDto } from './dto/update-bag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRoleEnum } from '../common/types/enums';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('bags')
export class BagsController {
  constructor(private readonly bagsService: BagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER)
  create(@Body() createBagDto: CreateBagDto) {
    return this.bagsService.create(createBagDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER)
  findAll() {
    return this.bagsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER)
  findOne(@Param('id') id: string) {
    return this.bagsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER)
  update(@Param('id') id: string, @Body() updateBagDto: UpdateBagDto) {
    return this.bagsService.update(+id, updateBagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.USER)
  remove(@Param('id') id: string) {
    return this.bagsService.remove(+id);
  }
}
