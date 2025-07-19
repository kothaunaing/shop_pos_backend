import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoginSchema } from 'src/auth/yup-schema/login.schema';
import { registerSchema } from 'src/auth/yup-schema/register.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { Schema, ValidationError } from 'yup';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(userId: string) {
    const JwtSecret = this.config.get('JWT_SECRET');
    const JwtExpiresIn = this.config.get('JWT_EXPIRES_IN');

    try {
      const token = await this.jwtService.signAsync(
        { sub: userId },
        {
          secret: JwtSecret,
          expiresIn: JwtExpiresIn,
        },
      );

      return token;
    } catch (error: any) {
      throw new InternalServerErrorException('Error generating jwt token');
    }
  }

  // async handleValidation(schema: Schema, dto: any) {
  //   try {
  //     await schema.validate(dto, { stripUnknown: true, abortEarly: false });
  //   } catch (error: any) {
  //     if (error instanceof ValidationError) {
  //       throw new BadRequestException({
  //         error: 'Validation failed',
  //         errors: error.errors,
  //         statusCode: HttpStatus.BAD_REQUEST,
  //       });
  //     }

  //     throw new BadRequestException('Validation failed');
  //   }
  // }

  async register(registerDto: Prisma.UserCreateInput) {
    // await this.handleValidation(registerSchema, registerDto);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
      select: { id: true },
    });

    if (existingUser)
      throw new ConflictException('User already exists with the email');

    const hashedPassword = await bcryptjs.hash(registerDto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      },
    });
    const token = await this.generateToken(createdUser.id);

    return {
      token,
      user: { ...createdUser, password: undefined },
    };
  }

  async login(loginDto: LoginDto) {
    // await this.handleValidation(LoginSchema, loginDto);

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new BadRequestException('Email or password is incorrect');

    const passwordMatched = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatched)
      throw new BadRequestException('Email or password is incorrect');

    const token = await this.generateToken(user.id);

    return {
      token,
      user: { ...user, password: undefined },
    };
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.prisma.user.delete({
        where: { id: userId },
        omit: { password: true },
      });

      return user;
    } catch (error: any) {
      throw new NotFoundException('User not found to delete');
    }
  }

  // async checkAuth(userId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     omit: { password: true },
  //   });

  //   if (!user) throw new NotFoundException('No user found');

  //   return user;
  // }
}
