export type EmployeeStatusValue = 'active' | 'inactive';

export type EmployeeStatus = {
  value: EmployeeStatusValue;
  display: string;
};

export type CreateEmployeePayload = {
  fullName: string;
  email: string;
  password: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseMonthlySalary: number;
  status: EmployeeStatusValue;
};

export type UpdateEmployeePayload = Partial<
  Omit<CreateEmployeePayload, 'password'>
>;

export type Employee = {
  id: number;
  fullName: string;
  email: string;
  role: 'HR' | 'EMPLOYEE';
  jobTitle: string;
  department: string;
  hireDate: string;
  baseMonthlySalary: number;
  status: EmployeeStatus;
};
