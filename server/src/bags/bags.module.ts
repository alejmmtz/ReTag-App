import { Module } from '@nestjs/common';
import { BagsService } from './bags.service';
import { BagsController } from './bags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BagEntity } from './entities/bag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BagEntity])],
  controllers: [BagsController],
  providers: [BagsService],
})
export class CartsModule {}
