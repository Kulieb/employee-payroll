export type Payslip = {
  id: number;
  employeeId: number;
  employeeFullName: string;
  year: number;
  month: number;
  baseSalaryPounds: number;
  allowancesPounds: number;
  grossPounds: number;
  incomeTaxPounds: number;
  socialInsurancePounds: number;
  netPounds: number;
  createdAt: string;
  createdBy: { id: string; name?: string | null; email?: string | null } | null;
};

export type CalculatePayslipsPayload = {
  year: number;
  month: number;
  employeeIds: number[];
};

export type PayslipCalculationListItem = {
  year: number;
  month: number;
  employeeCount: number;
  createdAt: string;
  employees: (Pick<
    Payslip,
    | 'baseSalaryPounds'
    | 'allowancesPounds'
    | 'grossPounds'
    | 'incomeTaxPounds'
    | 'socialInsurancePounds'
    | 'netPounds'
    | 'createdAt'
    | 'createdBy'
  > & { id: number; fullName: string })[];
};
