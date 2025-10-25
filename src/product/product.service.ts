import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductCategory } from '@prisma/client';
import { isObjectEmpty } from 'src/common/utils/is-object.empty';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProductDto,
  FindProductDto,
  UpdateProductDto,
} from 'src/product/dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
      select: { id: true },
    });

    if (existingProduct)
      throw new ConflictException(
        'Product already exists with sku: ' + dto.sku,
      );

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        image: dto.image,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        category: dto.category,
        import_price: dto.import_price,
      },
    });

    return product;
  }

  async findAll(dto: FindProductDto) {
    const page = dto.page;
    const size = dto.size;
    const skip = (page - 1) * size;

    const findData: Prisma.ProductWhereInput = {};

    if (dto.keyword)
      findData.OR = [
        { name: { contains: dto.keyword, mode: 'insensitive' } },
        {
          description: {
            contains: dto.keyword,
            mode: 'insensitive',
          },
        },
      ];

    findData.price = { gt: dto.minPrice, lt: dto.maxPrice };
    findData.stock = { gt: dto.minStock, lt: dto.maxStock };
    if (dto.category) findData.category = dto.category;

    const [products, totalElements, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: findData,
        take: size,
        skip,
        orderBy: {
          [dto.sortBy]: dto.sortDirection,
        },
      }),
      this.prisma.product.count({ where: findData }),
      this.prisma.product.count({}),
    ]);

    const totalPages = Math.ceil(totalElements / size);
    const hasNextPage = page < totalPages;

    return {
      page,
      size,
      totalElements,
      total,
      elements: products.length,
      nextPage: hasNextPage ? page + 1 : null,
      results: products,
    };
  }

  getProductCategories() {
    return Object.values(ProductCategory);
  }

  async findOne(id: string) {
    const whereClause: Prisma.ProductWhereInput = {};

    whereClause.OR = [{ id }, { sku: id }];

    const product = await this.prisma.product.findFirst({ where: whereClause });

    if (!product)
      throw new NotFoundException('Product not found with identifier: ' + id);

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product)
      throw new NotFoundException('Product not found to update with id: ' + id);

    if (isObjectEmpty(dto)) throw new BadRequestException('No data to update');

    if (dto.sku) {
      const product = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
        select: { id: true },
      });

      if (product)
        throw new ConflictException(
          'Product already exists with sku: ' + dto.sku,
        );
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        image: dto.image,
        description: dto.description,
        category: dto.category,
        price: dto.price,
        stock: dto.stock,
        sku: dto.sku,
        import_price: dto.import_price,
      },
    });

    return updatedProduct;
  }

  async delete(id: string) {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id },
        select: { id: true },
      });

      if (!product)
        throw new NotFoundException(
          'No product found to delete with id: ' + id,
        );

      const deletedProduct = await this.prisma.product.delete({
        where: { id },
      });

      return deletedProduct;
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error deleting product with id: ' + id,
      );
    }
  }
}
