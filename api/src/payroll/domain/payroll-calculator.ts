import type {
  EmployeePayStatus,
  PayrollConfig,
  PayrollInput,
  Payslip,
  TaxBand,
} from './payroll.types';

export class InactiveEmployeeError extends Error {
  constructor() {
    super('Cannot calculate a payslip for an inactive employee');
  }
}

export const assertActiveForPayslip = (status: EmployeePayStatus) => {
  if (status !== 'active') {
    throw new InactiveEmployeeError();
  }
};

export const raiseToNext10 = (amount: number) => {
  const thousandths = Math.round(amount * 1000);
  return Math.ceil(thousandths / 10_000) * 10;
};

const fail = (message: string): never => {
  throw new Error(message);
};

const isOrdered = (bands: TaxBand[]) => {
  let previous: number | null = null;

  return bands.every((band, index) => {
    const isLast = index === bands.length - 1;
    const rateIsValid =
      Number.isFinite(band.rate) && band.rate >= 0 && band.rate <= 1;
    const upperIsValid =
      band.upToPounds === null ||
      (Number.isFinite(band.upToPounds) && band.upToPounds > 0);
    const unlimitedIsLast = band.upToPounds !== null || isLast;
    const ordered =
      previous === null ||
      band.upToPounds === null ||
      band.upToPounds > previous;
    previous = band.upToPounds;
    return rateIsValid && upperIsValid && unlimitedIsLast && ordered;
  });
};

const assertTaxBands = (bands: TaxBand[]) => {
  if (
    bands.length === 0 ||
    bands[bands.length - 1].upToPounds !== null ||
    !isOrdered(bands)
  ) {
    fail('Tax brackets configuration is invalid');
  }
};

const assertConfig = (config: PayrollConfig) => {
  const rateIsValid = config.insuranceRate >= 0 && config.insuranceRate <= 1;
  const limitsAreValid =
    config.insurableWageMinPounds >= 0 &&
    config.insurableWageMaxPounds >= config.insurableWageMinPounds;

  if (!rateIsValid || !limitsAreValid) {
    fail('Insurance configuration is invalid');
  }
};

const assertInput = (input: PayrollInput) => {
  if (!Number.isInteger(input.baseSalaryPounds) || input.baseSalaryPounds < 0) {
    fail('Base salary must be a whole number of pounds and cannot be negative');
  }
  if (!Number.isInteger(input.allowancesPounds) || input.allowancesPounds < 0) {
    fail('Allowances must be a whole number of pounds and cannot be negative');
  }
};

export const annualIncomeTax = (amount: number, bands: TaxBand[]) => {
  assertTaxBands(bands);
  if (!Number.isFinite(amount) || amount < 0) {
    fail('Annual gross income must be finite and cannot be negative');
  }
  let tax = 0;
  let lower = 0;

  for (const band of bands) {
    if (amount <= lower) {
      break;
    }
    const upper = band.upToPounds ?? amount;
    const slice = Math.min(amount, upper) - lower;
    tax += (slice * Math.round(band.rate * 1000)) / 1000;
    lower = upper;
  }

  return tax;
};

const socialInsurance = (baseSalaryPounds: number, config: PayrollConfig) => {
  const insurableWage = Math.min(
    Math.max(baseSalaryPounds, config.insurableWageMinPounds),
    config.insurableWageMaxPounds,
  );
  const raw = (insurableWage * Math.round(config.insuranceRate * 1000)) / 1000;
  return raiseToNext10(raw);
};

export const calculatePayslip = (
  input: PayrollInput,
  config: PayrollConfig,
): Payslip => {
  assertInput(input);
  assertConfig(config);

  const grossPounds = input.baseSalaryPounds + input.allowancesPounds;
  const annualGrossPounds = grossPounds * 12;
  const incomeTaxPounds = raiseToNext10(
    annualIncomeTax(annualGrossPounds, config.taxBands) / 12,
  );
  const socialInsurancePounds = socialInsurance(input.baseSalaryPounds, config);

  return {
    baseSalaryPounds: input.baseSalaryPounds,
    allowancesPounds: input.allowancesPounds,
    grossPounds,
    incomeTaxPounds,
    socialInsurancePounds,
    netPounds: grossPounds - incomeTaxPounds - socialInsurancePounds,
  };
};
