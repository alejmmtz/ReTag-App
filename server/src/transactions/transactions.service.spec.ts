import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { TransactionEntity } from './entities/transaction.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '../common/types/enums';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

void describe('TransactionsServiceTest', () => {
  let service: TransactionsService;

  const transactionsRepositoryMock = {
    find: jest.fn<(options: any) => Promise<TransactionEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<TransactionEntity | null>>(),
    create: jest.fn(),
    save: jest.fn<
      (transaction: TransactionEntity) => Promise<TransactionEntity>
    >(),
  };

  const garmentsRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<GarmentEntity | null>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: transactionsRepositoryMock,
        },
        {
          provide: getRepositoryToken(GarmentEntity),
          useValue: garmentsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(TransactionsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and saves a sale transaction', async () => {
    const buyerId = '1';

    const data: CreateTransactionDto = {
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
    };

    const garmentMock = {
      id: '2',
      seller: {
        id: '3',
      },
    } as GarmentEntity;

    const createdTransaction = {
      buyerId: '1',
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
      tradeGarmentId: undefined,
      status: TransactionStatusEnum.PENDING,
    } as TransactionEntity;

    const savedTransaction = {
      ...createdTransaction,
      id: '4',
    };

    garmentsRepositoryMock.findOne.mockResolvedValue(garmentMock);
    transactionsRepositoryMock.create.mockReturnValue(createdTransaction);
    transactionsRepositoryMock.save.mockResolvedValue(savedTransaction);

    const result = await service.create(buyerId, data);

    expect(result).toEqual(savedTransaction);

    expect(transactionsRepositoryMock.create).toHaveBeenCalledWith({
      buyerId: '1',
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
      tradeGarmentId: undefined,
      status: TransactionStatusEnum.PENDING,
    });

    expect(transactionsRepositoryMock.save).toHaveBeenCalledWith(
      createdTransaction,
    );
  });

  it('throws NotFoundException when garment does not exist', async () => {
    const buyerId = '1';

    const data: CreateTransactionDto = {
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
    };

    garmentsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(buyerId, data)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when trade garment is missing', async () => {
    const buyerId = '1';

    const data: CreateTransactionDto = {
      garmentId: '2',
      transactionType: TransactionTypeEnum.TRADE,
    };

    const garmentMock = {
      id: '2',
      seller: {
        id: '3',
      },
    } as GarmentEntity;

    garmentsRepositoryMock.findOne.mockResolvedValue(garmentMock);

    await expect(service.create(buyerId, data)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns the transaction history', async () => {
    const buyerId = '1';

    const transactions = [
      {
        id: '4',
        buyerId: '1',
        garmentId: '2',
        transactionType: TransactionTypeEnum.SALE,
        status: TransactionStatusEnum.PENDING,
      },
      {
        id: '5',
        buyerId: '1',
        garmentId: '3',
        transactionType: TransactionTypeEnum.SALE,
        status: TransactionStatusEnum.COMPLETED,
      },
    ] as TransactionEntity[];

    transactionsRepositoryMock.find.mockResolvedValue(transactions);

    const result = await service.findAll(buyerId, {});

    expect(result).toEqual(transactions);

    expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        buyerId: '1',
      },
      relations: {
        garment: true,
        tradeGarment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('returns one transaction', async () => {
    const buyerId = '1';
    const transactionId = '4';

    const transaction = {
      id: '4',
      buyerId: '1',
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
      status: TransactionStatusEnum.PENDING,
    } as TransactionEntity;

    transactionsRepositoryMock.findOne.mockResolvedValue(transaction);

    const result = await service.findOne(buyerId, transactionId);

    expect(result).toEqual(transaction);

    expect(transactionsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: '4',
        buyerId: '1',
      },
      relations: {
        garment: true,
        tradeGarment: true,
      },
    });
  });

  it('throws NotFoundException when transaction does not exist', async () => {
    const buyerId = '1';
    const transactionId = '4';

    transactionsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(buyerId, transactionId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and saves the transaction status', async () => {
    const buyerId = '1';
    const transactionId = '4';

    const transaction = {
      id: '4',
      buyerId: '1',
      garmentId: '2',
      transactionType: TransactionTypeEnum.SALE,
      status: TransactionStatusEnum.PENDING,
    } as TransactionEntity;

    const data: UpdateTransactionStatusDto = {
      status: TransactionStatusEnum.IN_PROGRESS,
    };

    transactionsRepositoryMock.findOne.mockResolvedValue(transaction);
    transactionsRepositoryMock.save.mockResolvedValue(transaction);

    const result = await service.updateStatus(buyerId, transactionId, data);

    expect(result.status).toBe(TransactionStatusEnum.IN_PROGRESS);

    expect(transactionsRepositoryMock.save).toHaveBeenCalledWith(transaction);
  });
});
