import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateRevenueRulesDto,
  GetRevenueRulesDto,
  UpdateRevenueRulesDto,
} from './revenue-rules.dto';
import { InOutType, MoneyServiceType, Operator } from '@prisma/client';

@Injectable()
export class RevenueRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRevenueRule(dto: CreateRevenueRulesDto, userId: string) {
    const rule = await this.prisma.revenueRules.create({
      data: {
        name: dto.name,
        inOutType: dto.inOutType,
        operator: dto.operator,
        percentage: dto.percentage,
        value: dto.value,
        secondValue: dto.secondValue,
        userId,
        serviceType: dto.serviceType,
      },
      include: {
        createdBy: true,
      },
    });

    return rule;
  }

  async updateRevnueRule(dto: UpdateRevenueRulesDto, id: string) {
    const rule = await this.prisma.revenueRules.update({
      where: { id },
      data: {
        name: dto.name,
        inOutType: dto.inOutType,
        operator: dto.operator,
        percentage: dto.percentage,
        value: dto.value,
        secondValue: dto.secondValue,
        serviceType: dto.serviceType,
      },
      include: {
        createdBy: true,
      },
    });

    return rule;
  }

  async findAll(dto: GetRevenueRulesDto) {
    const rules = await this.prisma.revenueRules.findMany({
      where: {
        serviceType: dto.serviceType,
        inOutType: dto.inOutType,
      },
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      count: rules.length,
      serviceType: dto.serviceType || 'ALL',
      inOutType: dto.inOutType || 'ALL',
      rules,
    };
  }

  async deleteRevenue(id: string) {
    const existingRule = await this.prisma.revenueRules.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!existingRule) throw new NotFoundException('Rule not found to delete');

    await this.prisma.revenueRules.delete({
      where: { id },
      select: { id: true },
    });

    return { message: 'Deleted successfully' };
  }

  async calculateRevenue(
    amount: number,
    inOutType: InOutType,
    moneyServiceType: MoneyServiceType,
  ): Promise<number> {
    const rules = await this.prisma.revenueRules.findMany({
      where: { inOutType, serviceType: moneyServiceType },
      orderBy: { createdAt: 'asc' },
    });

    let totalRevenue = 0;

    for (const rule of rules) {
      let isRuleApplicable = false;

      switch (rule.operator) {
        case Operator.GT:
          isRuleApplicable = amount > rule.value;
          break;
        case Operator.LT:
          isRuleApplicable = amount < rule.value;
          break;
        case Operator.EQ:
          isRuleApplicable = amount === rule.value;
          break;
        case Operator.GTE:
          isRuleApplicable = amount >= rule.value;
          break;
        case Operator.LTE:
          isRuleApplicable = amount <= rule.value;
          break;
        case Operator.BETWEEN:
          isRuleApplicable = rule.secondValue
            ? amount >= rule.value && amount <= rule.secondValue
            : amount >= rule.value;
          break;
        default:
          isRuleApplicable = false;
      }

      if (isRuleApplicable) {
        if (rule.percentage > 0) {
          totalRevenue += (amount * rule.percentage) / 100;
        } else {
          totalRevenue += rule.value || 0;
        }
      }
    }

    return totalRevenue;
  }
}
