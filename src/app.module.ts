import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { DashboardModule } from './dashboard/dashboard.module';
import { ImagekitModule } from './imagekit/imagekit.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryUsage } from 'process';
import { SocketModule } from 'src/socket/socket.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    JwtModule.register({ global: true }),
    MulterModule.register({ storage: memoryUsage() }),
    PrismaModule,
    AuthModule,
    UserModule,
    DashboardModule,
    ImagekitModule,
    SocketModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
