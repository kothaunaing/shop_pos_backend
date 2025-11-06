import { Module } from '@nestjs/common';
import { MoneyInoutService } from './money-inout.service';
import { MoneyInoutController } from './money-inout.controller';
import { ImagekitModule } from 'src/imagekit/imagekit.module';
import { RevenueRulesModule } from 'src/revenue-rules/revenue-rules.module';

@Module({
  controllers: [MoneyInoutController],
  providers: [MoneyInoutService],
  imports: [ImagekitModule, RevenueRulesModule],
})
export class MoneyInoutModule {}
