import { PAYROLL_CONFIG } from './payroll.config';
import {
  InactiveEmployeeError,
  annualIncomeTax,
  assertActiveForPayslip,
  calculatePayslip,
  raiseToNext10,
} from './payroll-calculator';
import type { PayrollConfig, TaxBand } from './payroll.types';

describe('calculatePayslip', () => {
  const config: PayrollConfig = PAYROLL_CONFIG;

  it('raises 5264 to the next 10 pounds', () => {
    expect(raiseToNext10(5264)).toBe(5270);
    expect(raiseToNext10(5270)).toBe(5270);
  });

  it('calculates net pay from gross, annual tax, and insurance', () => {
    const result = calculatePayslip(
      { baseSalaryPounds: 10_000, allowancesPounds: 1_500 },
      config,
    );

    // Gross 11,500. Annual 138,000.
    // Tax 0 + 1,500 + 2,250 + 13,600 = 17,350 per year, 1,445.83 per month, raised to 1,450.
    // Insurance 10,000 * 11% = 1,100.
    expect(result).toEqual({
      baseSalaryPounds: 10_000,
      allowancesPounds: 1_500,
      grossPounds: 11_500,
      incomeTaxPounds: 1_450,
      socialInsurancePounds: 1_100,
      netPounds: 8_950,
    });
  });

  it('supports zero allowances', () => {
    const result = calculatePayslip(
      { baseSalaryPounds: 10_000, allowancesPounds: 0 },
      config,
    );

    expect(result.grossPounds).toBe(10_000);
    expect(result.incomeTaxPounds).toBe(1_150);
    expect(result.netPounds).toBe(7_750);
  });

  it('charges no tax on the first annual band', () => {
    expect(annualIncomeTax(40_000, config.taxBands)).toBe(0);
  });

  it('stops at 10% on the second annual band boundary', () => {
    expect(annualIncomeTax(55_000, config.taxBands)).toBe(1_500);
  });

  it('retains the lower brackets for high annual income', () => {
    const result = calculatePayslip(
      { baseSalaryPounds: 50_000, allowancesPounds: 0 },
      config,
    );

    expect(annualIncomeTax(600_000, config.taxBands)).toBe(124_750);
    expect(annualIncomeTax(600_012, config.taxBands)).toBe(124_753);
    expect(result.incomeTaxPounds).toBe(10_400);
    expect(result.netPounds).toBe(37_760);
    expect(result.grossPounds).toBe(50_000);
  });

  it('uses the same progressive schedule above 1,200,000', () => {
    expect(annualIncomeTax(1_200_000, config.taxBands)).toBe(274_750);
    expect(annualIncomeTax(1_200_012, config.taxBands)).toBe(274_753);
  });

  it.each([
    [0, 0],
    [40_001, 0.1],
    [70_000, 3_750],
    [200_000, 29_750],
    [400_000, 74_750],
    [400_001, 74_750.25],
  ])('calculates annual tax on %p as %p', (gross, tax) => {
    expect(annualIncomeTax(gross, config.taxBands)).toBeCloseTo(tax, 6);
  });

  const invalidBands: TaxBand[][] = [
    [],
    [{ upToPounds: 40_000, rate: 0 }],
    [
      { upToPounds: null, rate: 0 },
      { upToPounds: 40_000, rate: 0.1 },
    ],
    [
      { upToPounds: 55_000, rate: 0 },
      { upToPounds: 40_000, rate: 0.1 },
      { upToPounds: null, rate: 0.2 },
    ],
    [{ upToPounds: null, rate: -0.1 }],
    [{ upToPounds: null, rate: 1.1 }],
    [{ upToPounds: null, rate: NaN }],
    [
      { upToPounds: Infinity, rate: 0 },
      { upToPounds: null, rate: 0.1 },
    ],
  ];
  it.each(invalidBands.map((bands) => ({ bands })))(
    'rejects invalid tax brackets $bands',
    ({ bands }) => {
      expect(() => annualIncomeTax(100_000, bands)).toThrow(
        'Tax brackets configuration is invalid',
      );
    },
  );

  it('uses the minimum insurable wage when the base salary is below it', () => {
    const result = calculatePayslip(
      { baseSalaryPounds: 2_000, allowancesPounds: 0 },
      config,
    );

    expect(result.incomeTaxPounds).toBe(0);
    expect(result.socialInsurancePounds).toBe(300);
    expect(result.netPounds).toBe(1_700);
  });

  it('uses the maximum insurable wage when the base salary is above it', () => {
    const result = calculatePayslip(
      { baseSalaryPounds: 20_000, allowancesPounds: 0 },
      config,
    );

    expect(result.socialInsurancePounds).toBe(1_840);
  });

  it('rejects an inactive employee', () => {
    expect(() => assertActiveForPayslip('inactive')).toThrow(
      InactiveEmployeeError,
    );
  });

  it('rejects a negative base salary', () => {
    expect(() =>
      calculatePayslip({ baseSalaryPounds: -1, allowancesPounds: 0 }, config),
    ).toThrow(
      'Base salary must be a whole number of pounds and cannot be negative',
    );
  });
});
