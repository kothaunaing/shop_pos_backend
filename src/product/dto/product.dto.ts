import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProductCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SortDirection } from 'src/common/enums/index.enum';
import * as yup from 'yup';

enum SortBy {
  NAME = 'name',
  SKU = 'sku',
  PRICE = 'price',
  STOCK = 'stock',
  UPDATEDAT = 'updatedAt',
  CREATEDAT = 'createdAt',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of a product',
    example: 'Pencil',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique indentifier for a product',
    example: 'P0001',
  })
  @IsString()
  sku: string;

  @ApiPropertyOptional({
    description: 'Description for a product (optional)',
    example: '',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the product', example: 10 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'Number of items in the stock (optional)',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product Category',
    default: ProductCategory.OTHER,
    enum: ProductCategory,
  })
  @IsEnum(ProductCategory)
  @IsOptional()
  category: ProductCategory = ProductCategory.OTHER;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class FindProductDto {
  @ApiPropertyOptional({ description: 'Page for pagination', default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  size: number = 10;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum stock' })
  @Type(() => Number)
  @IsOptional()
  minStock?: number;

  @ApiPropertyOptional({ description: 'Maximum stock' })
  @IsString()
  @Type(() => Number)
  @IsOptional()
  maxStock?: number;

  @ApiPropertyOptional({
    description: 'Product Category',
    enum: ProductCategory,
    default: '',
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: SortBy,
    default: SortBy.CREATEDAT,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.CREATEDAT;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;
}

export const createProductSchema = yup.object({
  name: yup.string().required('Name is required'),
  sku: yup.string().required('SKU is required'),
  description: yup.string().optional(),
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Price is required'),
  stock: yup.number().typeError('Stock must be a number').optional(),
  category: yup.string().oneOf(Object.values(ProductCategory)).optional(),
});

export const updateProductSchema = createProductSchema.partial();
