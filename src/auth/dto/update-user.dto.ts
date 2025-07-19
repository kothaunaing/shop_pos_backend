import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'New name of the user',
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'New profile picture (link of an image)',
    example: 'https://images/my-image.jpg',
    required: false,
  })
  profilePic?: string;
}
