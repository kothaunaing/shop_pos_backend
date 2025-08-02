import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email of the regisered user',
    example: 'admin@shop.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'Password of the regisered user',
    example: 'admin',
    required: true,
  })
  password: string;
}
