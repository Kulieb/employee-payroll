import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { Role } from '../generated/prisma/enums.js';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { EmployeeRepository } from './employee.repository';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.employee.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  findByIds(ids: number[]) {
    return this.prisma.employee.findMany({ where: { id: { in: ids } } });
  }

  findAll() {
    return this.prisma.employee.findMany({
      where: { role: Role.EMPLOYEE },
    });
  }

  create(data: Prisma.EmployeeCreateInput) {
    return this.prisma.employee.create({ data });
  }

  update(id: number, data: Prisma.EmployeeUpdateInput) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.employee.delete({ where: { id } });
  }
}
