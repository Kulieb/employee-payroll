export interface TaxBand {
  upToPounds: number | null;
  rate: number;
}

export interface Allowance {
  name: string;
  amountPounds: number;
}

export interface PayrollConfig {
  allowances: Allowance[];
  taxBands: TaxBand[];
  insuranceRate: number;
  insurableWageMinPounds: number;
  insurableWageMaxPounds: number;
}

export interface PayrollInput {
  baseSalaryPounds: number;
  allowancesPounds: number;
}

export interface Payslip {
  baseSalaryPounds: number;
  allowancesPounds: number;
  grossPounds: number;
  incomeTaxPounds: number;
  socialInsurancePounds: number;
  netPounds: number;
}

export type EmployeePayStatus = 'active' | 'inactive';
