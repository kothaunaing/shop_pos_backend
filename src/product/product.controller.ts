import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { YupValidationPipe } from 'src/common/pipes/yup-validation.pipe';
import {
  CreateProductDto,
  createProductSchema,
  FindProductDto,
  UpdateProductDto,
  updateProductSchema,
} from 'src/product/dto/product.dto';
import { ProductService } from 'src/product/product.service';

@Controller('products')
@ApiTags('Product')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @ApiOperation({
    description: 'Create a product',
    summary: 'Create a product',
  })
  @ApiResponse({
    description: 'Return created product',
    example: {
      id: 'cmdaaxk2f0001ekjshi294b87',
      name: 'Pencil',
      sku: 'P0003',
      description: '',
      price: 10,
      stock: 0,
      createdAt: '2025-07-19T13:46:44.055Z',
      updatedAt: '2025-07-19T13:46:44.055Z',
    },
    status: HttpStatus.CREATED,
  })
  create(
    @Body(new YupValidationPipe(createProductSchema)) dto: CreateProductDto,
  ) {
    return this.productService.create(dto);
  }

  @Get('')
  @ApiOperation({
    description: 'Find products with filters and pagination',
    summary: 'Find products with filters and pagination',
  })
  @ApiResponse({
    description: 'Return list of products with additional information',
    example: {
      page: 1,
      size: 10,
      totalElements: 20,
      total: 50,
      nextPage: 2,
      elements: 1,
      results: [
        {
          id: 'cmdaaxk2f0001ekjshi294b87',
          name: 'Pencil',
          sku: 'P0003',
          description: '',
          price: 10,
          stock: 0,
          createdAt: '2025-07-19T13:46:44.055Z',
          updatedAt: '2025-07-19T13:46:44.055Z',
        },
      ],
    },
    status: HttpStatus.OK,
  })
  findAll(@Query() dto: FindProductDto) {
    return this.productService.findAll(dto);
  }

  @Get('categories')
  @ApiOperation({
    description: 'Get product categories',
    summary: 'Get Product categories',
  })
  @ApiResponse({
    description: 'Return product categories',

    status: HttpStatus.OK,
  })
  getProductCategories() {
    return this.productService.getProductCategories();
  }

  @Get(':id')
  @ApiOperation({
    description: 'Find a product by id or sku',
    summary: 'Find a product by id or sku',
  })
  @ApiResponse({
    description: 'Return matched product',
    example: {
      id: 'cmdaaxk2f0001ekjshi294b87',
      name: 'Pencil',
      sku: 'P0003',
      description: '',
      price: 10,
      stock: 0,
      createdAt: '2025-07-19T13:46:44.055Z',
      updatedAt: '2025-07-19T13:46:44.055Z',
    },
    status: HttpStatus.OK,
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    description: 'Update a product with id',
    summary: 'Update a product with id',
  })
  @ApiResponse({
    description: 'Return updated product',
    example: {
      id: 'cmdaaxk2f0001ekjshi294b87',
      name: 'Pencil',
      sku: 'P0003',
      description: '',
      price: 10,
      stock: 0,
      createdAt: '2025-07-19T13:46:44.055Z',
      updatedAt: '2025-07-19T13:46:44.055Z',
    },
    status: HttpStatus.OK,
  })
  update(
    @Param('id') id: string,
    @Body(new YupValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'Delete a product by id',
    summary: 'Delete a product by id',
  })
  @ApiResponse({
    description: 'Return deleted product',
    example: {
      id: 'cmdaaxk2f0001ekjshi294b87',
      name: 'Pencil',
      sku: 'P0003',
      description: '',
      price: 10,
      stock: 0,
      createdAt: '2025-07-19T13:46:44.055Z',
      updatedAt: '2025-07-19T13:46:44.055Z',
    },
    status: HttpStatus.OK,
  })
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
