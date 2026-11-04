import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  async findCatalogCategory(id: number): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOneBy({
      id,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} was not found`);
    }

    return category;
  }

  async findCatalogBrand(id: number): Promise<BrandEntity> {
    const brand = await this.brandsRepository.findOneBy({
      id,
    });

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} was not found`);
    }

    return brand;
  }

  async findCatalogCare(id: number): Promise<CareEntity> {
    const care = await this.careRepository.findOneBy({ id });

    if (!care) {
      throw new NotFoundException(`Care details with id ${id} was not found`);
    }

    return care;
  }

  async findCatalogColor(id: number): Promise<ColorEntity> {
    const color = await this.colorsRepository.findOneBy({ id });

    if (!color) {
      throw new NotFoundException(`Color with id ${id} was not found`);
    }

    return color;
  }

  async findCatalogSize(id: number): Promise<SizeEntity> {
    const size = await this.sizesRepository.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Size with id ${id} was not found`);
    }

    return size;
  }

  async findCatalogTag(id: number): Promise<TagEntity> {
    const tag = await this.tagsRepository.findOneBy({ id });

    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} was not found`);
    }

    return tag;
  }

  async findCatalogColors(ids: number[]): Promise<ColorEntity[]> {
    const colors = await this.colorsRepository.findBy({ id: In(ids) });

    const foundIds = new Set(colors.map((color) => color.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Colors with ids ${missingIds.join(', ')} were not found`,
      );
    }

    return colors;
  }

  async findCatalogTags(ids: number[]): Promise<TagEntity[]> {
    const tags = await this.tagsRepository.findBy({ id: In(ids) });

    const foundIds = new Set(tags.map((tag) => tag.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Tags with ids ${missingIds.join(', ')} were not found`,
      );
    }

    return tags;
  }
}
