import { Module } from '@nestjs/common';
import { EmployeeModule } from '../employee/employee.module';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PAYSLIP_REPOSITORY } from './payslip.repository';
import { PrismaPayslipRepository } from './prisma-payslip.repository';

@Module({
  imports: [EmployeeModule],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    {
      provide: PAYSLIP_REPOSITORY,
      useClass: PrismaPayslipRepository,
    },
  ],
})
export class PayrollModule {}
