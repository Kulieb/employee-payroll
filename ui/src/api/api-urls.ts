export const apiUrls = {
  auth: {
    login: { url: '/auth/login', method: 'post' as const },
    logout: { url: '/auth/logout', method: 'post' as const },
    me: { url: '/auth/me', method: 'get' as const },
  },
  employees: { url: '/employees', method: 'get' as const },
  employee: { url: '/employees', method: 'get' as const },
  createEmployee: { url: '/employees', method: 'post' as const },
  updateEmployee: { url: '/employees', method: 'patch' as const },
  deleteEmployee: { url: '/employees', method: 'delete' as const },
  payslipCalculations: {
    url: '/payroll/calculations',
    method: 'get' as const,
  },
  calculatePayslips: {
    url: '/payroll/calculations',
    method: 'post' as const,
  },
  myPayslip: { url: '/payroll/me/payslip', method: 'get' as const },
};
