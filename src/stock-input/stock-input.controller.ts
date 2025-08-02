import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockInputService } from './stock-input.service';
import { CreateStockInputDto, FindStockInputDto } from './dto/stock-input.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Stock Input')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('stock-input')
export class StockInputController {
  constructor(private readonly stockInputService: StockInputService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a stock input',
    description: 'Add a stock input and increment the product stock',
  })
  create(
    @Body() createStockInputDto: CreateStockInputDto,
    @Req() req: Request,
  ) {
    const userId = req['userId'];

    return this.stockInputService.create(createStockInputDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get stock inputs with pagination and filters',
    description: 'Get stock inputs with pagination and filters',
  })
  findAll(@Query() dto: FindStockInputDto) {
    return this.stockInputService.findAll(dto);
  }
}
