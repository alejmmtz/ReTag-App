import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionEntity } from './entities/transaction.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '../common/types/enums';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,

    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,
  ) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    const garment = await this.garmentsRepository.findOne({
      where: { id: dto.garmentId },
      relations: {
        seller: true,
      },
    });

    if (!garment) {
      throw new NotFoundException('Garment not found');
    }

    if (garment.seller.id === buyerId) {
      throw new BadRequestException(
        'You cannot create a transaction for your own garment',
      );
    }

    if (
      dto.transactionType === TransactionTypeEnum.TRADE &&
      !dto.tradeGarmentId
    ) {
      throw new BadRequestException(
        'A trade garment is required for trade transactions',
      );
    }

    //closet
    if (
      dto.transactionType === TransactionTypeEnum.TRADE &&
      dto.tradeGarmentId
    ) {
      const tradeGarment = await this.garmentsRepository.findOne({
        where: { id: dto.tradeGarmentId },
        relations: {
          seller: true,
        },
      });

      if (!tradeGarment) {
        throw new NotFoundException('Trade garment not found');
      }

      if (tradeGarment.seller.id !== buyerId) {
        throw new BadRequestException(
          'The trade garment must belong to the buyer',
        );
      }
    }

    const transaction = this.transactionsRepository.create({
      buyerId,
      garmentId: dto.garmentId,
      transactionType: dto.transactionType,
      tradeGarmentId: dto.tradeGarmentId,
      status: TransactionStatusEnum.PENDING,
    });

    return this.transactionsRepository.save(transaction);
  }
}
