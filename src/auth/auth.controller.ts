import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { LoginSchema } from 'src/auth/yup-schema/login.schema';
import { registerSchema } from 'src/auth/yup-schema/register.schema';
import { YupValidationPipe } from 'src/common/pipes/yup-validation.pipe';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ description: 'Create a new user' })
  // @ApiResponse({
  //   description: 'Return created user with token',
  //   status: HttpStatus.CREATED,
  // })
  // register(
  //   @Body(new YupValidationPipe(registerSchema))
  //   registerDto: RegisterDto,
  // ) {
  //   return this.authService.register(registerDto);
  // }

  @Post('login')
  @ApiOperation({
    description: 'Login to account',
    summary: 'Login to your account',
  })
  @ApiResponse({
    description: 'Return the user with token',
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  login(@Body(new YupValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('check-auth')
  @ApiOperation({
    description: 'Get current user data',
    summary: 'Get current logged in user data',
  })
  @ApiResponse({
    description: 'Return the user with token',
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  async checkAuth(@Req() req: Request) {
    // const userId = req['userId'];
    const token = req['token'];
    const user = req['user'];

    // const user = await this.authService.checkAuth(userId);

    return { token, user };
  }
}
