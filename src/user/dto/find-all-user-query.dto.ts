import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class FindAllUserQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name (partial match)',
    example: '',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    required: false,
    example: '1',
    description: 'Page to paginate',
    type: Number,
  })
  @Type(() => Number)
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({
    required: false,
    example: '10',
    description: 'Items per page',
    type: Number,
  })
  @Type(() => Number)
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({
    required: false,
    enum: Role,
    description: 'Filter by role',
    default: '',
  })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['name', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}
