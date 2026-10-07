import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { Employee } from '../generated/prisma/client.js';
import { Role as DbRole } from '../generated/prisma/enums.js';
import {
  CreateEmployeeDto,
  DeleteEmployeeResponseDto,
  EMPLOYEE_STATUS_RESPONSE,
  EmployeeResponseDto,
  Role,
  UpdateEmployeeDto,
} from './dto/employee.dto';
import { type AuthUser } from '../auth/auth.controller';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepository,
} from './employee.repository';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employees: EmployeeRepository,
  ) {}

  async createEmployee(
    payload: CreateEmployeeDto,
    user: AuthUser,
  ): Promise<EmployeeResponseDto> {
    const existing = await this.employees.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const employee = await this.employees.create({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: await hash(payload.password, 10),
      role: DbRole.EMPLOYEE,
      jobTitle: payload.jobTitle,
      department: payload.department,
      hireDate: payload.hireDate,
      baseMonthlySalary: payload.baseMonthlySalary,
      status: payload.status,
      createdAt: new Date(),
      createdBy: String(user.id),
    });

    return await this.toResponse(employee);
  }

  async listEmployees(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employees.findAll();
    return await Promise.all(
      employees.map((employee) => this.toResponse(employee)),
    );
  }

  async employeeDetails(id: number): Promise<EmployeeResponseDto> {
    const employee = await this.employees.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return await this.toResponse(employee);
  }

  async updateEmployee(
    id: number,
    payload: UpdateEmployeeDto,
    user: AuthUser,
  ): Promise<EmployeeResponseDto> {
    const current = await this.employees.findById(id);
    if (!current) {
      throw new NotFoundException('Employee not found');
    }

    if (payload.email) {
      const existing = await this.employees.findByEmail(payload.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const employee = await this.employees.update(id, {
      fullName: payload.fullName,
      email: payload.email,
      jobTitle: payload.jobTitle,
      department: payload.department,
      hireDate: payload.hireDate,
      baseMonthlySalary: payload.baseMonthlySalary,
      status: payload.status,
      updatedAt: new Date(),
      updatedBy: String(user.id),
    });

    return await this.toResponse(employee);
  }

  async deleteEmployee(id: number): Promise<DeleteEmployeeResponseDto> {
    const employee = await this.employees.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employees.delete(id);

    return { message: 'Employee deleted successfully' };
  }

  private async toResponse(employee: Employee): Promise<EmployeeResponseDto> {
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role === DbRole.HR ? Role.HR : Role.EMPLOYEE,
      jobTitle: employee.jobTitle,
      department: employee.department,
      hireDate: employee.hireDate.toISOString(),
      baseMonthlySalary: employee.baseMonthlySalary,
      status: EMPLOYEE_STATUS_RESPONSE[employee.status],
      meta: {
        createdAt: employee.createdAt,
        createdBy: await this.metaUser(employee.createdBy),
        updatedAt: employee.updatedAt,
        updatedBy: await this.metaUser(employee.updatedBy),
      },
    };
  }

  private async metaUser(id: string | null) {
    if (!id) {
      return null;
    }

    const person = await this.employees.findById(Number(id));
    return {
      id,
      name: person?.fullName ?? null,
      email: person?.email ?? null,
    };
  }
}
