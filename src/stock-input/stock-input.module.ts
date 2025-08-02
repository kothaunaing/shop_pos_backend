import { Module } from '@nestjs/common';
import { StockInputService } from './stock-input.service';
import { StockInputController } from './stock-input.controller';

@Module({
  controllers: [StockInputController],
  providers: [StockInputService],
})
export class StockInputModule {}
