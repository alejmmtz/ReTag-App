import { Module } from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { GarmentsController } from './garments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { GarmentImageEntity } from './entities/garment-image.entity';
import { GarmentRulesService } from './garment-rules.service';
import { CategoryEntity } from '../catalogs/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      GarmentEntity,
      GarmentImageEntity,
      CategoryEntity,
    ]),
  ],
  controllers: [GarmentsController],
  providers: [GarmentsService, GarmentRulesService],
})
export class GarmentsModule {}
