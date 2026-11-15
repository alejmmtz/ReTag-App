import { Module } from '@nestjs/common';
import { BagsService } from './bags.service';
import { BagsController } from './bags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BagEntity } from './entities/bag.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([BagEntity, GarmentEntity])],
  controllers: [BagsController],
  providers: [BagsService],
})
export class CartsModule {}
