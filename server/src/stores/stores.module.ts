import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { StoreImage } from './entities/store-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, StoreImage])],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
