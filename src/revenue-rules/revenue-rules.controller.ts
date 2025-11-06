import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RevenueRulesService } from './revenue-rules.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateRevenueRulesDto,
  GetRevenueRulesDto,
  UpdateRevenueRulesDto,
} from './revenue-rules.dto';
import { Request } from 'express';

@Controller('revenue-rules')
@ApiTags('Revenue Rules')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RevenueRulesController {
  constructor(private readonly revenueRulesService: RevenueRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a revenue rule' })
  async create(@Body() dto: CreateRevenueRulesDto, @Req() req: Request) {
    const userId = req['userId'];
    return this.revenueRulesService.createRevenueRule(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get revenue rules with filters' })
  async findAll(@Query() dto: GetRevenueRulesDto) {
    return this.revenueRulesService.findAll(dto);
  }

  @Patch('id')
  @ApiOperation({ summary: 'Create a revenue rule' })
  async update(@Body() dto: UpdateRevenueRulesDto, @Param('id') id: string) {
    return this.revenueRulesService.updateRevnueRule(dto, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rule' })
  async remove(@Param('id') id: string) {
    return this.revenueRulesService.deleteRevenue(id);
  }
}
