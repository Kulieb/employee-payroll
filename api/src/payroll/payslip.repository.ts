import { Payslip, Prisma } from '../generated/prisma/client.js';

export type PayslipWithCreator = Payslip & {
  createdBy: { id: number; fullName: string; email: string } | null;
};

export const PAYSLIP_REPOSITORY = Symbol('PAYSLIP_REPOSITORY');

export interface PayslipRepository {
  findByEmployeesPeriod(
    employeeIds: number[],
    year: number,
    month: number,
  ): Promise<Payslip[]>;
  findByEmployeePeriod(
    employeeId: number,
    year: number,
    month: number,
  ): Promise<PayslipWithCreator | null>;
  createBatch(
    data: Prisma.PayslipCreateManyInput[],
  ): Promise<PayslipWithCreator[]>;
  findAllWithEmployee(): Promise<
    (PayslipWithCreator & {
      employee: { id: number; fullName: string };
    })[]
  >;
}
