import type { EmployeeFormValues } from './validation-schema';

export const employeeFormDefaultValues: EmployeeFormValues = {
  fullName: '',
  email: '',
  password: '',
  jobTitle: '',
  department: '',
  hireDate: '',
  baseMonthlySalary: 0,
  status: 'active',
};
