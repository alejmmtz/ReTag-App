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
import { FilterTransactionsQueryDto } from './dto/filter-transactions-query.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

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

  async findAll(buyerId: string, query: FilterTransactionsQueryDto) {
    return this.transactionsRepository.find({
      where: {
        buyerId,
        ...(query.status && { status: query.status }),
      },
      relations: {
        garment: true,
        tradeGarment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(buyerId: string, id: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: {
        id,
        buyerId,
      },
      relations: {
        garment: true,
        tradeGarment: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(
    buyerId: string,
    id: string,
    dto: UpdateTransactionStatusDto,
  ) {
    const transaction = await this.findOne(buyerId, id);

    transaction.status = dto.status;

    return this.transactionsRepository.save(transaction);
  }
}
