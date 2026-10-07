import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PayslipRepository } from './payslip.repository';

const createdBy = {
  select: { id: true, fullName: true, email: true },
} as const;

@Injectable()
export class PrismaPayslipRepository implements PayslipRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmployeePeriod(employeeId: number, year: number, month: number) {
    return this.prisma.payslip.findUnique({
      where: {
        employeeId_year_month: { employeeId, year, month },
      },
      include: { createdBy },
    });
  }

  findByEmployeesPeriod(employeeIds: number[], year: number, month: number) {
    if (employeeIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.payslip.findMany({
      where: {
        year,
        month,
        employeeId: { in: employeeIds },
      },
    });
  }

  create(data: Prisma.PayslipCreateInput) {
    return this.prisma.payslip.create({ data, include: { createdBy } });
  }

  findAllWithEmployee() {
    return this.prisma.payslip.findMany({
      include: {
        employee: { select: { id: true, fullName: true } },
        createdBy,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { employeeId: 'asc' }],
    });
  }
}
