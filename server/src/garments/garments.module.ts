import { Module } from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { GarmentsController } from './garments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarmentEntity } from './entities/garment.entity';
import { GarmentImageEntity } from './entities/garment-image.entity';
import { GarmentRulesService } from './garment-rules.service';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { EventEntity } from '../events/entities/event.entity';
import { GarmentImagesService } from './garment-images.service';
import { StoreEntity } from '../stores/entities/store.entity';

@Module({
  imports: [
    AuthModule,
    CatalogsModule,
    TypeOrmModule.forFeature([
      GarmentEntity,
      GarmentImageEntity,
      EventEntity,
      StoreEntity,
    ]),
  ],

  controllers: [GarmentsController],
  providers: [GarmentsService, GarmentRulesService, GarmentImagesService],
  exports: [GarmentsService],
})
export class GarmentsModule {}
