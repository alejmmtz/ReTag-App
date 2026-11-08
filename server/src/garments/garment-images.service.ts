import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateImageDto } from '../common/dto/create-image.dto';

@Injectable()
export class GarmentImagesService {
  toGarmentImages(images: CreateImageDto[], garmentId: string) {
    const covers = images
      .map((image, index) => (image.isCover === true ? index : -1))
      .filter((index) => index !== -1);

    const hasExplicitSelection = images.some(
      (image) => image.isCover !== undefined,
    );

    if (hasExplicitSelection && covers.length !== 1) {
      throw new BadRequestException(
        'When specifying isCover, exactly one garment image must be the cover',
      );
    }

    const coverIndex = covers[0] ?? 0;

    return images.map((image, index) => ({
      url: image.url,
      isCover: index === coverIndex,
      garment: { id: garmentId },
    }));
  }
}
