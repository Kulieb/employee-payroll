import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';

const validEmployee = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Abcd@123',
  jobTitle: 'Accountant',
  department: 'Finance',
  hireDate: '2026-01-15',
  baseMonthlySalary: 5000,
  status: 'active',
};

const employeeFields = [
  'fullName',
  'email',
  'jobTitle',
  'department',
  'hireDate',
  'baseMonthlySalary',
  'status',
] as const;

describe('employee validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 7, 12));
  });

  afterEach(() => jest.useRealTimers());

  const invalidFields: [string, unknown][] = [
    ['fullName', ' \t\n '],
    ['fullName', 'a'.repeat(101)],
    ['fullName', 123],
    ['email', 'invalid-email'],
    ['jobTitle', '   '],
    ['department', '\t'],
    ['hireDate', 'not-a-date'],
    ['hireDate', '2026-10-08'],
    ['baseMonthlySalary', 0],
    ['baseMonthlySalary', -1],
    ['baseMonthlySalary', 1.5],
    ['baseMonthlySalary', true],
    ['baseMonthlySalary', ''],
    ['baseMonthlySalary', 'not-a-number'],
    ['status', 'unknown'],
  ];

  const cases: [string, ClassConstructor<object>, Record<string, unknown>][] = [
    ['create', CreateEmployeeDto, validEmployee],
    ['update', UpdateEmployeeDto, {}],
  ];

  describe.each(cases)('%s', (_, dto, base) => {
    it.each(invalidFields)('rejects invalid %s: %p', (field, value) => {
      const errors = validateSync(
        plainToInstance(dto, { ...base, [field]: value }),
      );
      expect(errors.map((error) => error.property)).toContain(field);
    });

    it.each(employeeFields)('rejects null %s', (field) => {
      const errors = validateSync(
        plainToInstance(dto, { ...base, [field]: null }),
      );
      expect(errors.map((error) => error.property)).toContain(field);
    });
  });

  it('accepts valid input and trims text without altering the password', () => {
    const employee = plainToInstance(CreateEmployeeDto, {
      ...validEmployee,
      fullName: '  Jane Doe  ',
      email: '  jane@example.com  ',
      jobTitle: ' Accountant ',
      department: ' Finance ',
      password: ' Abcd@123 ',
      baseMonthlySalary: '5000',
    });
    expect(validateSync(employee)).toEqual([]);
    expect(employee).toMatchObject({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      jobTitle: 'Accountant',
      department: 'Finance',
      password: ' Abcd@123 ',
      baseMonthlySalary: 5000,
    });
  });

  it.each([...employeeFields, 'password'])('requires %s on create', (field) => {
    const payload: Record<string, unknown> = { ...validEmployee };
    delete payload[field];
    const errors = validateSync(plainToInstance(CreateEmployeeDto, payload));
    expect(errors.map((error) => error.property)).toContain(field);
  });

  it('accepts the name length, date, and salary boundaries', () => {
    const employee = plainToInstance(CreateEmployeeDto, {
      ...validEmployee,
      fullName: 'a'.repeat(100),
      hireDate: new Date(2026, 9, 7),
      baseMonthlySalary: 1,
      status: 'inactive',
    });
    expect(validateSync(employee)).toEqual([]);
  });

  it.each(['short', 'abcdefgh', 'Abcdefgh', 'Abcdefg1'])(
    'rejects weak password %s',
    (password) => {
      const errors = validateSync(
        plainToInstance(CreateEmployeeDto, { ...validEmployee, password }),
      );
      expect(errors.map((error) => error.property)).toContain('password');
    },
  );

  it('accepts omitted fields and valid partial updates', () => {
    expect(validateSync(plainToInstance(UpdateEmployeeDto, {}))).toEqual([]);
    const employee = plainToInstance(UpdateEmployeeDto, {
      jobTitle: ' Senior Accountant ',
    });
    expect(validateSync(employee)).toEqual([]);
    expect(employee.jobTitle).toBe('Senior Accountant');
  });
});
