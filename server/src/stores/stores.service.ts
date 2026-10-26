import { Injectable } from '@nestjs/common';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  findAll() {
    return `This action returns all stores`;
  }

  findOne(id: string) {
    return `This action returns a #${id} store`;
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    return `This action updates a #${id} store`;
  }

  remove(id: string) {
    return `This action removes a #${id} store`;
  }
}
