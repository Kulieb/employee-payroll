import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EMPLOYEE_REPOSITORY } from './employee.repository';
import { EmployeeService } from './employee.service';
import { PrismaEmployeeRepository } from './prisma-employee.repository';

@Module({
  controllers: [EmployeeController],
  exports: [EMPLOYEE_REPOSITORY],
  providers: [
    EmployeeService,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: PrismaEmployeeRepository,
    },
  ],
})
export class EmployeeModule {}
