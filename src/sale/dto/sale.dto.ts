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

  @ApiProperty({ example: true, required: false, description: 'Paid or not' })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}

export class UpdateSaleDto {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;
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
}
