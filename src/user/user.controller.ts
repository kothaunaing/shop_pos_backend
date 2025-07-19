import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllUserQueryDto } from 'src/user/dto/find-all-user-query.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll(@Query() query: FindAllUserQueryDto) {
    const intPage = parseInt(query.page!) || 1;
    const intSize = parseInt(query.size!) || 10;

    return this.userService.findAll(intPage, intSize, query);
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get a user by ID or email' })
  findOne(@Param('identifier') identifier: string) {
    return this.userService.findOne(identifier);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin Only)' })
  createUser(@Body() registerDto: RegisterDto) {
    return this.userService.createUser(registerDto);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user (Admin or Owner Only)' })
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a user (Admin Only)' })
  deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
