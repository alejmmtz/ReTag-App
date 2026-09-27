import { Module } from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { GarmentsController } from './garments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { GarmentImageEntity } from './entities/garment-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GarmentEntity, GarmentImageEntity])],
  controllers: [GarmentsController],
  providers: [GarmentsService],
})
export class GarmentsModule {}
