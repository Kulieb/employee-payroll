import { Role } from '../model';

export const homeTitle = (role: Role | null | undefined) => {
  if (role === Role.HR) {
    return 'Admin Dashboard';
  }
  if (role === Role.EMPLOYEE) {
    return 'Payroll Dashboard';
  }
  return 'Home';
};
