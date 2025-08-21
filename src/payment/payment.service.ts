import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQRCodeDto } from './dto/create-qrcode.dto';
import { UpdateQRCodeDto } from './dto/update-qrcode.dto';
import { PaymentType, Prisma, PaymentTypeEnum } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPaymentType(createQRCodeDto: CreateQRCodeDto) {
    // Check if payment type already exists
    const existingType = await this.prisma.paymentType.findUnique({
      where: { type: createQRCodeDto.type },
    });

    if (existingType) {
      throw new Error(`Payment type ${createQRCodeDto.type} already exists`);
    }

    return this.prisma.paymentType.create({
      data: {
        type: createQRCodeDto.type,
        imageUrl: createQRCodeDto.imageUrl,
        isActive: createQRCodeDto.isActive ?? true,
      },
    });
  }

  async getPaymentTypeByType(type: PaymentTypeEnum) {
    const paymentType = await this.prisma.paymentType.findUnique({
      where: { type },
    });

    if (!paymentType) {
      throw new NotFoundException(`Payment type ${type} not found`);
    }

    return paymentType;
  }

  async updatePaymentType(type: PaymentTypeEnum, updateDto: UpdateQRCodeDto) {
    try {
      return await this.prisma.paymentType.update({
        where: { type },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Payment type ${type} not found`);
        }
      }
      throw error;
    }
  }

  async deletePaymentType(type: PaymentTypeEnum) {
    try {
      return await this.prisma.paymentType.delete({
        where: { type },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Payment type ${type} not found`);
        }
      }
      throw error;
    }
  }

  async getAllPaymentTypes(includeInactive = false) {
    const where: Prisma.PaymentTypeWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    // Use the correct relation name as defined in your Prisma schema
    // If the relation is named differently in your schema, update it here
    return this.prisma.paymentType.findMany({
      where,
      orderBy: {
        type: 'asc',
      },
    });
  }
}
