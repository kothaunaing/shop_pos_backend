import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { InOutType, MoneyServiceType, Operator } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRevenueRulesDto {
  @ApiPropertyOptional({ description: 'Name of rule' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Operator', enum: Operator })
  @IsEnum(Operator)
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty({ description: 'Value' })
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiPropertyOptional({
    description: 'Second Value if operator is BETWEEN',
  })
  @IsOptional()
  @IsNumber()
  secondValue?: number;

  @ApiProperty({
    description: 'Percentage',
  })
  @IsNotEmpty()
  @IsNumber()
  percentage: number;

  @ApiProperty({ description: 'Service Type', enum: MoneyServiceType })
  @IsEnum(MoneyServiceType)
  @IsNotEmpty()
  serviceType: MoneyServiceType = MoneyServiceType.KPay;

  @ApiProperty({ description: 'In/Out Type', enum: InOutType })
  @IsEnum(InOutType)
  @IsNotEmpty()
  inOutType: InOutType;
}

export class UpdateRevenueRulesDto extends PartialType(CreateRevenueRulesDto) {}

export class GetRevenueRulesDto {
  @ApiPropertyOptional({ description: 'Service Type', enum: MoneyServiceType })
  @IsEnum(MoneyServiceType)
  @IsOptional()
  serviceType?: MoneyServiceType;

  @ApiPropertyOptional({ description: 'In/Out Type', enum: InOutType })
  @IsEnum(InOutType)
  @IsOptional()
  inOutType?: InOutType;
}
