import { Module } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from './entities/brand.entity';
import { CareEntity } from './entities/care-details.entity';
import { CategoryEntity } from './entities/category.entity';
import { ColorEntity } from './entities/color.entity';
import { SizeEntity } from './entities/size.entity';
import { TagEntity } from './entities/tag.entity';
import { CatalogsSeedService } from './catalogs-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BrandEntity,
      CareEntity,
      CategoryEntity,
      ColorEntity,
      SizeEntity,
      TagEntity,
    ]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService, CatalogsSeedService],
})
export class CatalogsModule {}
