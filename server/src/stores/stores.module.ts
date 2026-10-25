import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { StoreImage } from './entities/store-image.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, StoreImage, UserEntity])],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
