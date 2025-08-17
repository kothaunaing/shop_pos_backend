import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { PaymentTypeEnum } from '@prisma/client';

export class CreateQRCodeDto {
  @ApiProperty({ 
    description: 'Type of payment (e.g., KPay, WavePay, Cash)',
    enum: PaymentTypeEnum
  })
  @IsEnum(PaymentTypeEnum)
  @IsNotEmpty()
  type: PaymentTypeEnum;

  @ApiProperty({ 
    description: 'URL to the payment QR code or logo image',
    required: false 
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
