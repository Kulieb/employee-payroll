import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EMPLOYEE_REPOSITORY } from './employee.repository';
import { EmployeeService } from './employee.service';

jest.mock(
  '../generated/prisma/enums.js',
  () => ({
    Role: { HR: 'HR', EMPLOYEE: 'EMPLOYEE' },
  }),
  { virtual: true },
);

describe('employee email uniqueness', () => {
  let service: EmployeeService;
  const repository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const user = { id: 1, email: 'hr@example.com', role: 'HR' as const };
  const employee = {
    id: 2,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    role: 'EMPLOYEE',
    jobTitle: 'Accountant',
    department: 'Finance',
    hireDate: new Date('2026-01-15'),
    baseMonthlySalary: 5000,
    status: 'active',
    createdAt: new Date('2026-01-15'),
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    Object.values(repository).forEach((mock) => mock.mockReset());
    const module = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: EMPLOYEE_REPOSITORY, useValue: repository },
      ],
    }).compile();
    service = module.get(EmployeeService);
  });

  it('rejects a duplicate email on create before saving', async () => {
    repository.findByEmail.mockResolvedValue(employee);
    await expect(
      service.createEmployee(
        {
          fullName: 'John Doe',
          email: employee.email,
          password: 'Abcd@123',
          jobTitle: 'Accountant',
          department: 'Finance',
          hireDate: new Date('2026-01-15'),
          baseMonthlySalary: 5000,
          status: 'active',
        },
        user,
      ),
    ).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects an email owned by another employee on update', async () => {
    repository.findById.mockResolvedValue(employee);
    repository.findByEmail.mockResolvedValue({ ...employee, id: 3 });
    await expect(
      service.updateEmployee(2, { email: employee.email }, user),
    ).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('allows an employee to keep their own email', async () => {
    repository.findById.mockResolvedValue(employee);
    repository.findByEmail.mockResolvedValue(employee);
    repository.update.mockResolvedValue(employee);
    await expect(
      service.updateEmployee(2, { email: employee.email }, user),
    ).resolves.toMatchObject({
      id: 2,
      email: employee.email,
    });
    expect(repository.update).toHaveBeenCalledTimes(1);
  });
});
