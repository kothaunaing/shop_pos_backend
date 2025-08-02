import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSaleDto, FindSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  create(@Body() createSaleDto: CreateSaleDto, @Req() req: Request) {
    const userId = req['userId'];
    return this.saleService.create(createSaleDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales' })
  findAll(@Query() dto: FindSaleDto) {
    return this.saleService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale (mainly for payment status)' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(id, updateSaleDto);
  }
}
