import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@email.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'apple123',
    required: true,
  })
  password: string;
}
