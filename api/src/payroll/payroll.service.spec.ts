import { Test } from '@nestjs/testing';
import { EMPLOYEE_REPOSITORY } from '../employee/employee.repository';
import { PAYSLIP_REPOSITORY } from './payslip.repository';
import { PayrollService } from './payroll.service';

jest.mock(
  '../generated/prisma/enums.js',
  () => ({
    EmployeeStatus: { active: 'active', inactive: 'inactive' },
  }),
  { virtual: true },
);

describe('HR payslip history', () => {
  let service: PayrollService;
  const findAllWithEmployee = jest.fn();
  const findById = jest.fn();
  const findByEmployeesPeriod = jest.fn();
  const createBatch = jest.fn();

  beforeEach(async () => {
    findAllWithEmployee.mockReset();
    findById.mockReset();
    findByEmployeesPeriod.mockReset();
    createBatch.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: EMPLOYEE_REPOSITORY, useValue: { findById } },
        {
          provide: PAYSLIP_REPOSITORY,
          useValue: { findAllWithEmployee, findByEmployeesPeriod, createBatch },
        },
      ],
    }).compile();
    service = module.get(PayrollService);
  });

  it('returns the stored amounts and groups employees by period', async () => {
    const amounts = {
      baseSalaryPounds: 10000,
      allowancesPounds: 1500,
      grossPounds: 11500,
      incomeTaxPounds: 1450,
      socialInsurancePounds: 1100,
      netPounds: 8950,
      createdAt: '2026-10-07T12:00:00.000Z',
      createdBy: { id: '10', name: 'Interface HR', email: 'hr@example.com' },
    };
    findAllWithEmployee.mockResolvedValue([
      {
        ...amounts,
        createdAt: new Date('2026-10-07T14:00:00.000Z'),
        createdBy: {
          id: 10,
          fullName: 'Interface HR',
          email: 'hr@example.com',
        },
        year: 2026,
        month: 10,
        employee: { id: 1, fullName: 'Jane Doe' },
      },
      {
        ...amounts,
        createdAt: new Date('2026-10-07T13:00:00.000Z'),
        createdBy: {
          id: 11,
          fullName: 'Another HR',
          email: 'another@example.com',
        },
        netPounds: 8900,
        year: 2026,
        month: 10,
        employee: { id: 2, fullName: 'John Doe' },
      },
      {
        ...amounts,
        createdAt: new Date('2026-09-07T12:00:00.000Z'),
        createdBy: null,
        year: 2026,
        month: 9,
        employee: { id: 1, fullName: 'Jane Doe' },
      },
    ]);

    await expect(service.listCalculations()).resolves.toEqual([
      {
        year: 2026,
        month: 10,
        employeeCount: 2,
        createdAt: '2026-10-07T13:00:00.000Z',
        employees: [
          {
            ...amounts,
            id: 1,
            fullName: 'Jane Doe',
            createdAt: '2026-10-07T14:00:00.000Z',
          },
          {
            ...amounts,
            netPounds: 8900,
            id: 2,
            fullName: 'John Doe',
            createdAt: '2026-10-07T13:00:00.000Z',
            createdBy: {
              id: '11',
              name: 'Another HR',
              email: 'another@example.com',
            },
          },
        ],
      },
      {
        year: 2026,
        month: 9,
        employeeCount: 1,
        createdAt: '2026-09-07T12:00:00.000Z',
        employees: [
          {
            ...amounts,
            id: 1,
            fullName: 'Jane Doe',
            createdAt: '2026-09-07T12:00:00.000Z',
            createdBy: null,
          },
        ],
      },
    ]);
  });

  it('returns an empty history when no payslips have been calculated', async () => {
    findAllWithEmployee.mockResolvedValue([]);
    await expect(service.listCalculations()).resolves.toEqual([]);
  });

  it('records the signed-in HR user and returns the database creation time', async () => {
    const user = { id: 10, email: 'hr@example.com', role: 'HR' as const };
    findById.mockResolvedValue({
      id: 1,
      fullName: 'Jane Doe',
      status: 'active',
      baseMonthlySalary: 10000,
    });
    findByEmployeesPeriod.mockResolvedValue([]);
    createBatch.mockResolvedValue([
      {
        id: 20,
        employeeId: 1,
        year: 2026,
        month: 10,
        baseSalaryPounds: 10000,
        allowancesPounds: 1500,
        grossPounds: 11500,
        incomeTaxPounds: 1450,
        socialInsurancePounds: 1100,
        netPounds: 8950,
        createdAt: new Date('2026-10-07T12:00:00.000Z'),
        createdBy: { id: 10, fullName: 'Interface HR', email: user.email },
      },
    ]);
    const result = await service.calculatePayslips(
      { year: 2026, month: 10, employeeIds: [1] },
      user,
    );
    expect(createBatch).toHaveBeenCalledWith([
      expect.objectContaining({ createdBy: { connect: { id: user.id } } }),
    ]);
    expect(result[0]).toMatchObject({
      createdAt: '2026-10-07T12:00:00.000Z',
      createdBy: { id: '10', name: 'Interface HR', email: user.email },
    });
  });

  it('submits all employees in one batch and propagates a save failure', async () => {
    findById.mockImplementation((id: number) => ({
      id,
      fullName: `Employee ${id}`,
      status: 'active',
      baseMonthlySalary: 10000,
    }));
    findByEmployeesPeriod.mockResolvedValue([]);
    const error = new Error('Database unavailable');
    createBatch.mockRejectedValue(error);

    await expect(
      service.calculatePayslips(
        { year: 2026, month: 10, employeeIds: [1, 2, 1] },
        { id: 10, email: 'hr@example.com', role: 'HR' },
      ),
    ).rejects.toBe(error);
    expect(createBatch).toHaveBeenCalledTimes(1);
    expect(createBatch).toHaveBeenCalledWith([
      expect.objectContaining({ employee: { connect: { id: 1 } } }),
      expect.objectContaining({ employee: { connect: { id: 2 } } }),
    ]);
  });
});
