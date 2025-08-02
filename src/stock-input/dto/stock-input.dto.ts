import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SortDirection } from 'src/common/enums/index.enum';

enum SortBy {
  quantity = 'quantity',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class CreateStockInputDto {
  @ApiProperty({ description: 'Product Id', example: '' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}

export class UpdateStockInputDto extends PartialType(CreateStockInputDto) {}

export class FindStockInputDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size: number = 10;

  @ApiPropertyOptional({ description: 'Filter by added user id' })
  @IsOptional()
  @IsString()
  addedById?: string;

  @ApiPropertyOptional({ description: 'Maximum Quantity' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Minimum Quantity' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({
    description: 'Sort By',
    enum: SortBy,
    default: SortBy.createdAt,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.createdAt;

  @ApiPropertyOptional({
    description: 'Sort Direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;
}
