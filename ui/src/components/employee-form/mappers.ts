import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from '../../model';
import type { EmployeeFormValues } from './validation-schema';

export const employeeFormValuesFromEmployee = (
  employee: Employee,
): EmployeeFormValues => ({
  fullName: employee.fullName,
  email: employee.email,
  password: '',
  jobTitle: employee.jobTitle,
  department: employee.department,
  hireDate: employee.hireDate.slice(0, 10),
  baseMonthlySalary: employee.baseMonthlySalary,
  status: employee.status.value,
});

export const createPayloadFromForm = (
  values: EmployeeFormValues,
): CreateEmployeePayload => ({
  fullName: values.fullName,
  email: values.email,
  password: values.password,
  jobTitle: values.jobTitle,
  department: values.department,
  hireDate: new Date(values.hireDate).toISOString(),
  baseMonthlySalary: Number(values.baseMonthlySalary),
  status: values.status,
});

export const updatePayloadFromForm = (
  values: EmployeeFormValues,
): UpdateEmployeePayload => {
  const { password, ...payload } = createPayloadFromForm(values);
  void password;
  return payload;
};
