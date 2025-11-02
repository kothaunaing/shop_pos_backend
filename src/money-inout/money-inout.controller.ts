import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { MoneyInoutService } from './money-inout.service';
import {
  AdminOverviewQueryDto,
  CreateMoneyInoutDto,
  DateRangeQueryDto,
  DetailedStatsQueryDto,
  GetAllMoneyInoutsParamsDto,
} from './money-inout.dto';

@ApiTags('money-inout')
@ApiBearerAuth()
@Controller('money-inout')
@UseGuards(AuthGuard)
export class MoneyInoutController {
  constructor(private readonly moneyInoutService: MoneyInoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create a money in/out record with screenshot' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create money in/out record with screenshot',
    type: CreateMoneyInoutDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Money in/out record created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('screenshotFile'))
  async createMoneyInout(
    @Req() req: Request,
    @Body() createMoneyInoutDto: CreateMoneyInoutDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }), // Image files
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req['userId'] as string;
    return this.moneyInoutService.createMoneyInout(
      createMoneyInoutDto,
      file,
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all money in/out records' })
  @ApiResponse({
    status: 200,
    description: 'List of money in/out records',
  })
  async getAllMoneyInouts(@Query() dto: GetAllMoneyInoutsParamsDto) {
    const parsedPage = parseInt(dto.page!) || 1;
    const parsedSize = parseInt(dto.size!) || 10;

    return this.moneyInoutService.getAllMoneyInouts(
      parsedPage,
      parsedSize,
      dto.type,
      dto.serviceType,
      dto.startDate,
      dto.endDate,
    );
  }
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get money in/out statistics summary' })
  @ApiResponse({
    status: 200,
    description: 'Money in/out statistics summary',
  })
  async getMoneyInoutStats(@Query() query: DateRangeQueryDto): Promise<any> {
    return this.moneyInoutService.getMoneyInoutStats(
      query.startDate,
      query.endDate,
    );
  }

  @Get('stats/detailed')
  @ApiOperation({ summary: 'Get detailed money in/out statistics' })
  @ApiResponse({
    status: 200,
    description: 'Detailed money in/out statistics',
  })
  async getDetailedMoneyInoutStats(
    @Query() query: DetailedStatsQueryDto,
  ): Promise<any> {
    return this.moneyInoutService.getDetailedMoneyInoutStats(
      query.startDate,
      query.endDate,
      query.groupBy,
    );
  }

  @Get('admin/overview')
  @ApiOperation({
    summary: 'Get admin overview with combined stats and records',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin overview with stats and records',
  })
  async getAdminOverview(@Query() query: AdminOverviewQueryDto): Promise<any> {
    const parsedPage = parseInt(query.page!) || 1;
    const parsedSize = parseInt(query.limit!) || 10;

    return this.moneyInoutService.getAdminOverview(
      parsedPage,
      parsedSize,
      query.startDate,
      query.endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get money in/out record by ID' })
  @ApiParam({ name: 'id', description: 'Money in/out record ID' })
  @ApiResponse({
    status: 200,
    description: 'Money in/out record details',
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async getMoneyInoutById(@Param('id') id: string) {
    return this.moneyInoutService.getMoneyInoutById(id);
  }
}
