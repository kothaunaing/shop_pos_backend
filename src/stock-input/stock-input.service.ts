import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInputDto, FindStockInputDto } from './dto/stock-input.dto';
import { userSelect } from 'src/common/utils/includes-selects';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockInputService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStockInputDto: CreateStockInputDto, addedById: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: createStockInputDto.productId },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [_, stock] = await this.prisma.$transaction([
      // Update product stock
      this.prisma.product.update({
        where: { id: createStockInputDto.productId },
        data: {
          stock: {
            increment: createStockInputDto.quantity,
          },
        },
      }),
      // Create stock input record
      this.prisma.stockInput.create({
        data: {
          productId: createStockInputDto.productId,
          quantity: createStockInputDto.quantity,
          addedById,
        },
        include: {
          product: true,
          addedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return stock;
  }

  async findAll(dto: FindStockInputDto) {
    const page = dto.page;
    const size = dto.size;
    const skip = (page - 1) * size;

    const whereClause: Prisma.StockInputWhereInput = {};

    if (dto.addedById !== undefined) whereClause.addedById = dto.addedById;
    whereClause.quantity = { lt: dto.maxQuantity, gt: dto.minQuantity };

    const [stocks, totalElements, total] = await this.prisma.$transaction([
      this.prisma.stockInput.findMany({
        take: size,
        skip,
        where: whereClause,
        include: {
          product: true,

          addedBy: {
            select: {
              ...userSelect,
            },
          },
        },
        orderBy: {
          [dto.sortBy]: dto.sortDirection,
        },
      }),
      this.prisma.stockInput.count({ where: whereClause }),
      this.prisma.stockInput.count(),
    ]);
    const totalPages = Math.ceil(totalElements / size);
    const hasNextPage = page < totalPages;

    return {
      page,
      size,
      totalPages,
      totalElements,
      total,
      elements: stocks.length,
      nextPage: hasNextPage ? page + 1 : null,
      results: stocks,
    };
  }
}
