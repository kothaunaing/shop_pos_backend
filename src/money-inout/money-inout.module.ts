import { Module } from '@nestjs/common';
import { MoneyInoutService } from './money-inout.service';
import { MoneyInoutController } from './money-inout.controller';
import { ImagekitModule } from 'src/imagekit/imagekit.module';

@Module({
  controllers: [MoneyInoutController],
  providers: [MoneyInoutService],
  imports: [ImagekitModule],
})
export class MoneyInoutModule {}
