import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Min,
  IsString,
  IsDateString,
  IsIn,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MoneyServiceType {
  KPay = 'KPay',
  WavePay = 'WavePay',
}

export enum InOutType {
  IN = 'IN',
  OUT = 'OUT',
}

export class CreateMoneyInoutDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Screenshot image file (JPEG, PNG, GIF, WebP) max 5MB',
  })
  screenshotFile: any;

  @ApiProperty({
    type: 'number',
    minimum: 0,
    example: 10000,
    description: 'Transaction quantity/amount',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number) // Add this to transform string to number
  quantity: number;

  @ApiProperty({
    enum: MoneyServiceType,
    example: MoneyServiceType.KPay,
    description: 'Payment service type',
  })
  @IsEnum(MoneyServiceType)
  serviceType: MoneyServiceType;

  @ApiProperty({
    enum: InOutType,
    example: InOutType.IN,
    description: 'Transaction type (IN/OUT)',
  })
  @IsEnum(InOutType)
  type: InOutType;
}

export class GetAllMoneyInoutsParamsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: '1',
    example: '1',
  })
  @IsOptional()
  @Type(() => Number)
  page?: string = '1';

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: '10',
    example: '10',
  })
  @IsOptional()
  @Type(() => Number)
  size?: string = '10';

  @ApiPropertyOptional({
    description: 'Type of money inout',
    enum: InOutType,
  })
  @IsOptional()
  @IsString()
  @IsEnum(InOutType)
  type?: InOutType = InOutType.OUT;

  @ApiPropertyOptional({
    description: 'Service type',

    enum: MoneyServiceType,
  })
  @IsOptional()
  @IsString()
  @IsEnum(MoneyServiceType)
  serviceType?: MoneyServiceType = MoneyServiceType.KPay;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DateRangeQueryDto {
  @ApiProperty({
    required: false,
    description: 'Start date in ISO format (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'End date in ISO format (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class DetailedStatsQueryDto extends DateRangeQueryDto {
  @ApiProperty({
    required: false,
    enum: ['day', 'week', 'month'],
    default: 'day',
    description: 'Grouping interval for statistics',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month' = 'day';
}

export class AdminOverviewQueryDto extends DateRangeQueryDto {
  @ApiProperty({
    required: false,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Number of items per page',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
