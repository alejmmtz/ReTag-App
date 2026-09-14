import { Injectable } from '@nestjs/common';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';

@Injectable()
export class GarmentsService {
  create(createGarmentDto: CreateGarmentDto) {
    return 'This action adds a new garment';
  }

  findAll() {
    return `This action returns all garments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} garment`;
  }

  update(id: number, updateGarmentDto: UpdateGarmentDto) {
    return `This action updates a #${id} garment`;
  }

  remove(id: number) {
    return `This action removes a #${id} garment`;
  }
}
