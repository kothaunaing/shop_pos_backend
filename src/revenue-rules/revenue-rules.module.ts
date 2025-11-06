import { Module } from '@nestjs/common';
import { RevenueRulesService } from './revenue-rules.service';
import { RevenueRulesController } from './revenue-rules.controller';

@Module({
  controllers: [RevenueRulesController],
  providers: [RevenueRulesService],
  exports: [RevenueRulesService],
})
export class RevenueRulesModule {}
