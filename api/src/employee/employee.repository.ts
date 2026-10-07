import { Employee, Prisma } from '../generated/prisma/client.js';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
  findByEmail(email: string): Promise<Employee | null>;
  findById(id: number): Promise<Employee | null>;
  findAll(): Promise<Employee[]>;
  create(data: Prisma.EmployeeCreateInput): Promise<Employee>;
  update(id: number, data: Prisma.EmployeeUpdateInput): Promise<Employee>;
  delete(id: number): Promise<void>;
}
