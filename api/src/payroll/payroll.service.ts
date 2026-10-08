import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus } from '../generated/prisma/enums.js';
import type { AuthUser } from '../auth/auth.controller';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepository,
} from '../employee/employee.repository';
import { PAYROLL_CONFIG } from './domain/payroll.config';
import {
  InactiveEmployeeError,
  assertActiveForPayslip,
  calculatePayslip,
} from './domain/payroll-calculator';
import { CalculatePayslipsDto } from './dto/calculate-payslips.dto';
import { PayslipCalculationListItemDto } from './dto/payslip-calculation-list.dto';
import { PayslipResponseDto } from './dto/payslip-response.dto';
import {
  PAYSLIP_REPOSITORY,
  type PayslipRepository,
  type PayslipWithCreator,
} from './payslip.repository';

@Injectable()
export class PayrollService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employees: EmployeeRepository,
    @Inject(PAYSLIP_REPOSITORY)
    private readonly payslips: PayslipRepository,
  ) {}

  async calculatePayslips(
    payload: CalculatePayslipsDto,
    user: AuthUser,
  ): Promise<PayslipResponseDto[]> {
    const uniqueIds = [...new Set(payload.employeeIds)];
    const employees = await Promise.all(
      uniqueIds.map((id) => this.employees.findById(id)),
    );

    const missing = uniqueIds.find((id, index) => !employees[index]);
    if (missing !== undefined) {
      throw new NotFoundException('Employee not found');
    }

    const resolved = employees.filter(
      (employee): employee is NonNullable<typeof employee> => employee !== null,
    );

    for (const employee of resolved) {
      try {
        assertActiveForPayslip(
          employee.status === EmployeeStatus.active ? 'active' : 'inactive',
        );
      } catch (error) {
        if (error instanceof InactiveEmployeeError) {
          throw new BadRequestException(
            `Cannot calculate a payslip for inactive employee ${employee.fullName}`,
          );
        }
        throw error;
      }
    }

    const existing = await this.payslips.findByEmployeesPeriod(
      uniqueIds,
      payload.year,
      payload.month,
    );
    if (existing.length > 0) {
      const conflicts = existing.map((row) => {
        const employee = resolved.find((item) => item.id === row.employeeId);
        const name = employee?.fullName ?? 'Employee';
        return `Employee ${name} already has salary calculated for month ${payload.month} and year ${payload.year}`;
      });
      throw new ConflictException(conflicts.join('; '));
    }

    const allowancesPounds = PAYROLL_CONFIG.allowances.reduce(
      (total, allowance) => total + allowance.amountPounds,
      0,
    );

    const data = resolved.map((employee) => {
      const amounts = calculatePayslip(
        {
          baseSalaryPounds: employee.baseMonthlySalary,
          allowancesPounds,
        },
        PAYROLL_CONFIG,
      );

      return {
        employee: { connect: { id: employee.id } },
        createdBy: { connect: { id: user.id } },
        year: payload.year,
        month: payload.month,
        baseSalaryPounds: amounts.baseSalaryPounds,
        allowancesPounds: amounts.allowancesPounds,
        grossPounds: amounts.grossPounds,
        incomeTaxPounds: amounts.incomeTaxPounds,
        socialInsurancePounds: amounts.socialInsurancePounds,
        netPounds: amounts.netPounds,
      };
    });

    const rows = await this.payslips.createBatch(data);
    return rows.map((row, index) =>
      this.toResponse(row, resolved[index].fullName),
    );
  }

  async getMyPayslip(
    employeeId: number,
    year: number,
    month: number,
  ): Promise<PayslipResponseDto> {
    const employee = await this.employees.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const row = await this.payslips.findByEmployeePeriod(
      employeeId,
      year,
      month,
    );
    if (!row) {
      throw new NotFoundException(`No payslip found for ${month}/${year}`);
    }

    return this.toResponse(row, employee.fullName);
  }

  async listCalculations(): Promise<PayslipCalculationListItemDto[]> {
    const rows = await this.payslips.findAllWithEmployee();
    const grouped = new Map<string, PayslipCalculationListItemDto>();

    for (const row of rows) {
      const key = `${row.year}-${row.month}`;
      const current = grouped.get(key) ?? {
        year: row.year,
        month: row.month,
        employeeCount: 0,
        createdAt: row.createdAt.toISOString(),
        employees: [],
      };
      const createdAt = row.createdAt.toISOString();
      if (createdAt < current.createdAt) {
        current.createdAt = createdAt;
      }
      current.employees.push({
        id: row.employee.id,
        fullName: row.employee.fullName,
        baseSalaryPounds: row.baseSalaryPounds,
        allowancesPounds: row.allowancesPounds,
        grossPounds: row.grossPounds,
        incomeTaxPounds: row.incomeTaxPounds,
        socialInsurancePounds: row.socialInsurancePounds,
        netPounds: row.netPounds,
        createdAt: row.createdAt.toISOString(),
        createdBy: this.creatorResponse(row.createdBy),
      });
      current.employeeCount = current.employees.length;
      grouped.set(key, current);
    }

    return [...grouped.values()];
  }

  private toResponse(
    row: PayslipWithCreator,
    employeeFullName: string,
  ): PayslipResponseDto {
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeFullName,
      year: row.year,
      month: row.month,
      baseSalaryPounds: row.baseSalaryPounds,
      allowancesPounds: row.allowancesPounds,
      grossPounds: row.grossPounds,
      incomeTaxPounds: row.incomeTaxPounds,
      socialInsurancePounds: row.socialInsurancePounds,
      netPounds: row.netPounds,
      createdAt: row.createdAt.toISOString(),
      createdBy: this.creatorResponse(row.createdBy),
    };
  }

  private creatorResponse(creator: PayslipWithCreator['createdBy']) {
    return creator
      ? { id: String(creator.id), name: creator.fullName, email: creator.email }
      : null;
  }
}
