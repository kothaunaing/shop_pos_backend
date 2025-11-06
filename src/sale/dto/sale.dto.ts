import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Min,
  IsInt,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortDirection } from 'src/common/enums/index.enum';
import { PaymentTypeEnum } from '@prisma/client';

export enum SortBy {
  createdAt = 'createdAt',
  total = 'total',
}

export class SaleItemDto {
  @ApiProperty({ example: 'cuid-product-id', description: 'Prouct Id' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty({ type: [SaleItemDto], description: 'Product items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  // @ApiProperty({ example: true, required: false, description: 'Paid or not' })
  // @IsBoolean()
  // @IsOptional()
  // paid?: boolean;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentTypeEnum,
    required: true,
  })
  @IsEnum(PaymentTypeEnum)
  @IsNotEmpty()
  paymentType: PaymentTypeEnum;
}

export class UpdateSaleDto {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentTypeEnum,
  })
  @IsEnum(PaymentTypeEnum)
  @IsOptional()
  paymentType?: PaymentTypeEnum;
}

export class FindSaleDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size: number = 10;

  @ApiPropertyOptional({ description: 'Filter by cashier ID' })
  @IsOptional()
  @IsString()
  cashierId?: string;

  @ApiPropertyOptional({
    description: 'Filter by payment type',
    enum: PaymentTypeEnum,
  })
  @IsOptional()
  @IsEnum(PaymentTypeEnum)
  paymentType?: PaymentTypeEnum;

  @ApiPropertyOptional({ description: 'Minimum total amount' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minTotal?: number;

  @ApiPropertyOptional({ description: 'Maximum total amount' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxTotal?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: SortBy,
    default: SortBy.createdAt,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.createdAt;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;

  // 🗓️ Date filtering
  @ApiPropertyOptional({
    description: 'Filter by date type: today, month, week, or custom range',
    enum: ['today', 'month', 'week', 'custom'],
  })
  @IsOptional()
  @IsString()
  filterBy?: 'today' | 'month' | 'week' | 'custom';

  @ApiPropertyOptional({ description: 'Year for month/week filter' })
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: 'Month (1–12) for month/week filter' })
  @IsOptional()
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: 'Week number (1–5) in the month' })
  @IsOptional()
  @Type(() => Number)
  week?: number;

  @ApiPropertyOptional({
    description: 'Start date for custom date range (YYYY-MM-DD)',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for custom date range (YYYY-MM-DD)',
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
