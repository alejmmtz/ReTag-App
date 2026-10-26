import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  defaultBrands,
  defaultCareDetails,
  defaultCategories,
  defaultColors,
  defaultSizes,
  defaultTags,
} from './catalog-defaults';
import { BrandEntity } from './entities/brand.entity';
import { CareEntity } from './entities/care-details.entity';
import { CategoryEntity } from './entities/category.entity';
import { ColorEntity } from './entities/color.entity';
import { SizeEntity } from './entities/size.entity';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class CatalogsSeedService implements OnApplicationBootstrap {
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

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([
      this.seedBrands(),
      this.seedCareDetails(),
      this.seedCategories(),
      this.seedColors(),
      this.seedSizes(),
      this.seedTags(),
    ]);
  }

  private async seedBrands(): Promise<void> {
    const brands = await this.brandsRepository.find();
    const existingNames = new Set(
      brands.map((brand) => brand.name.trim().toLowerCase()),
    );
    const missingBrands = defaultBrands.filter(
      (brand) => !existingNames.has(brand.name.toLowerCase()),
    );

    if (missingBrands.length > 0) {
      await this.brandsRepository.save(
        this.brandsRepository.create(missingBrands),
      );
    }
  }

  private async seedCareDetails(): Promise<void> {
    const careDetails = await this.careRepository.find();
    const existingCareDetails = new Set(
      careDetails.map((care) => `${care.type}:${care.name.toLowerCase()}`),
    );
    const missingCareDetails = defaultCareDetails.filter(
      (care) =>
        !existingCareDetails.has(`${care.type}:${care.name.toLowerCase()}`),
    );

    if (missingCareDetails.length > 0) {
      await this.careRepository.save(
        this.careRepository.create(missingCareDetails),
      );
    }
  }

  private async seedCategories(): Promise<void> {
    const categories = await this.categoriesRepository.find();
    const existingNames = new Set(
      categories.map((category) => category.name.trim().toLowerCase()),
    );
    const missingCategories = defaultCategories.filter(
      (category) => !existingNames.has(category.name.toLowerCase()),
    );

    if (missingCategories.length > 0) {
      await this.categoriesRepository.save(
        this.categoriesRepository.create(missingCategories),
      );
    }
  }

  private async seedColors(): Promise<void> {
    const colors = await this.colorsRepository.find();
    const existingNames = new Set(
      colors.map((color) => color.name.trim().toLowerCase()),
    );
    const missingColors = defaultColors.filter(
      (color) => !existingNames.has(color.name.toLowerCase()),
    );

    if (missingColors.length > 0) {
      await this.colorsRepository.save(
        this.colorsRepository.create(missingColors),
      );
    }
  }

  private async seedSizes(): Promise<void> {
    const sizes = await this.sizesRepository.find();
    const existingSizes = new Set(
      sizes.map((size) => `${size.type}:${size.label.toLowerCase()}`),
    );
    const missingSizes = defaultSizes.filter(
      (size) => !existingSizes.has(`${size.type}:${size.label.toLowerCase()}`),
    );

    if (missingSizes.length > 0) {
      await this.sizesRepository.save(
        this.sizesRepository.create(missingSizes),
      );
    }
  }

  private async seedTags(): Promise<void> {
    const tags = await this.tagsRepository.find();
    const existingNames = new Set(
      tags.map((tag) => tag.name.trim().toLowerCase()),
    );
    const missingTags = defaultTags.filter(
      (tag) => !existingNames.has(tag.name.toLowerCase()),
    );

    if (missingTags.length > 0) {
      await this.tagsRepository.save(this.tagsRepository.create(missingTags));
    }
  }
}
