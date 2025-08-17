import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateQRCodeDto } from './dto/create-qrcode.dto';
import { UpdateQRCodeDto } from './dto/update-qrcode.dto';
import { PaymentTypeEnum, Role } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('payment')
@Controller('payment/types')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment type' })
  @ApiResponse({
    status: 201,
    description: 'Payment type created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or payment type already exists',
  })
  createPaymentType(@Body() createQRCodeDto: CreateQRCodeDto) {
    return this.paymentService.createPaymentType(createQRCodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment types' })
  @ApiResponse({ status: 200, description: 'Returns all payment types' })
  getAllPaymentTypes(@Query('includeInactive') includeInactive?: boolean) {
    return this.paymentService.getAllPaymentTypes(includeInactive === true);
  }

  @Get(':type')
  @ApiOperation({ summary: 'Get payment type by type' })
  @ApiParam({ name: 'type', enum: PaymentTypeEnum })
  @ApiResponse({ status: 200, description: 'Returns the payment type' })
  @ApiResponse({ status: 404, description: 'Payment type not found' })
  getPaymentTypeByType(@Param('type') type: PaymentTypeEnum) {
    return this.paymentService.getPaymentTypeByType(type);
  }

  @Put(':type')
  @ApiOperation({ summary: 'Update payment type' })
  @ApiParam({ name: 'type', enum: PaymentTypeEnum })
  @ApiResponse({
    status: 200,
    description: 'Payment type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment type not found' })
  updatePaymentType(
    @Param('type') type: PaymentTypeEnum,
    @Body() updateDto: UpdateQRCodeDto,
  ) {
    return this.paymentService.updatePaymentType(type, updateDto);
  }

  @Delete(':type')
  @ApiOperation({ summary: 'Delete payment type' })
  @ApiParam({ name: 'type', enum: PaymentTypeEnum })
  @ApiResponse({
    status: 200,
    description: 'Payment type deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete payment type in use',
  })
  @ApiResponse({ status: 404, description: 'Payment type not found' })
  deletePaymentType(@Param('type') type: PaymentTypeEnum) {
    return this.paymentService.deletePaymentType(type);
  }
}
