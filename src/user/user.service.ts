import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllUserQueryDto } from 'src/user/dto/find-all-user-query.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(page: number, size: number, filters: FindAllUserQueryDto) {
    const whereClause: Prisma.UserWhereInput = {
      name: filters.name
        ? { contains: filters.name, mode: 'insensitive' }
        : undefined,
      role: filters.role ?? undefined,
    };

    const skip = (page - 1) * size;

    const sortBy = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortDirection || 'desc';

    const [users, totalUsers] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: size,
        where: whereClause,
        orderBy: {
          [sortBy]: sortDirection,
        },
        omit: { password: true },
      }),

      this.prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalUsers / size);
    const hasNextPage = skip + size < totalUsers;

    return {
      page,
      totalPages,
      size,
      nextPage: hasNextPage ? page + 1 : null,
      totalElements: totalUsers,
      currentElements: users.length,
      results: users,
    };
  }

  async findOne(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ id: identifier }, { email: identifier }] },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async createUser(registerDto: Prisma.UserCreateInput) {
    return this.authService.register(registerDto);
  }

  async updateUser(userId: string, updateUserDto: Prisma.UserUpdateInput) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateUserDto.name,
          profilePic: updateUserDto.profilePic,
        },
        omit: { password: true },
      });

      return updatedUser;
    } catch (error: any) {
      throw new NotFoundException('No user found to update');
    }
  }

  async deleteUser(userId: string) {
    return this.authService.deleteUser(userId);
  }
}
