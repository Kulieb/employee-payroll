import type { PayrollConfig } from './payroll.types';

export const PAYROLL_CONFIG: PayrollConfig = {
  allowances: [
    { name: 'Transport', amountPounds: 500 },
    { name: 'Housing', amountPounds: 1_000 },
  ],
  taxBands: [
    { upToPounds: 40_000, rate: 0 },
    { upToPounds: 55_000, rate: 0.1 },
    { upToPounds: 70_000, rate: 0.15 },
    { upToPounds: 200_000, rate: 0.2 },
    { upToPounds: 400_000, rate: 0.225 },
    { upToPounds: null, rate: 0.25 },
  ],
  insuranceRate: 0.11,
  insurableWageMinPounds: 2_700,
  insurableWageMaxPounds: 16_700,
};
