import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandEntity } from './entities/brand.entity';
import { CareEntity } from './entities/care-details.entity';
import { CategoryEntity } from './entities/category.entity';
import { ColorEntity } from './entities/color.entity';
import { SizeEntity } from './entities/size.entity';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandsRepository: Repository<BrandEntity>,
    @InjectRepository(CareEntity)
    private readonly careRepository: Repository<CareEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(ColorEntity)
    private readonly colorsRepository: Repository<ColorEntity>,
    @InjectRepository(SizeEntity)
    private readonly sizesRepository: Repository<SizeEntity>,
    @InjectRepository(TagEntity)
    private readonly tagsRepository: Repository<TagEntity>,
  ) {}

  async findAll() {
    const [brands, careDetails, categories, colors, sizes, tags] =
      await Promise.all([
        this.brandsRepository.find({ order: { id: 'ASC' } }),
        this.careRepository.find({ order: { id: 'ASC' } }),
        this.categoriesRepository.find({ order: { id: 'ASC' } }),
        this.colorsRepository.find({ order: { id: 'ASC' } }),
        this.sizesRepository.find({ order: { id: 'ASC' } }),
        this.tagsRepository.find({ order: { id: 'ASC' } }),
      ]);

    return { brands, careDetails, categories, colors, sizes, tags };
  }
}
