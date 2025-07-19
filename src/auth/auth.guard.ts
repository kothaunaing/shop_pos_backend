import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];

    if (!authHeader)
      throw new UnauthorizedException('Authorization header is missing');

    const token = authHeader.split(' ')[1];

    if (!authHeader.startsWith('Bearer ') || !token)
      throw new UnauthorizedException('Invalid token');

    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // console.log(payload)
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        omit: { password: true },
      });

      if (!user) throw new NotFoundException('User not found');

      request['userId'] = payload.sub;
      request['user'] = user;
      request['token'] = token;
      return true;
    } catch (error: any) {
      console.log(error);
      throw new UnauthorizedException('Validation failed');
    }
  }
}
