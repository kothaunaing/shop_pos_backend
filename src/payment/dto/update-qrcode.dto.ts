import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUrl, IsBoolean, IsOptional } from 'class-validator';
import { CreateQRCodeDto } from './create-qrcode.dto';

export class UpdateQRCodeDto extends PartialType(CreateQRCodeDto) {
  @ApiProperty({ 
    description: 'URL to the payment QR code or logo image',
    required: false 
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ 
    description: 'Whether the payment type is active',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
