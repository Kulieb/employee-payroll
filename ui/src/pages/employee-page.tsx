import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  PAYROLL_MONTHS,
  payrollMonthLabel,
  payrollYearOptions,
} from '../core/constants/payroll-months';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import { useMyPayslip } from '../core/hooks/payroll';

const money = (pounds: number) => `EGP ${pounds.toLocaleString('en-US')}`;

const lineRow = (label: string, value: string, bold = false) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 2,
      py: 0.75,
    }}
  >
    <Typography sx={{ color: 'text.secondary', fontWeight: bold ? 700 : 400 }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: bold ? 700 : 500 }}>{value}</Typography>
  </Box>
);

export const EmployeePage = () => {
  const { currentUser } = useCurrentUser();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const { checkPayslip, payslip, isPending, error, reset } = useMyPayslip();

  const onCheck = () => {
    reset();
    checkPayslip({ year, month });
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Typography variant='h5'>Payroll Dashboard</Typography>
      <Paper
        sx={{
          p: 3,
          border: '1px solid #e6ebf5',
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          Look up your payslip
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            sx={{ justifyContent: 'space-between' }}
            direction='row'
            spacing={2}
          >
            <TextField
              select
              label='Month'
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              sx={{ minWidth: 200 }}
            >
              {PAYROLL_MONTHS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label='Year'
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              sx={{ minWidth: 200 }}
            >
              {payrollYearOptions().map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Button
            variant='contained'
            onClick={onCheck}
            disabled={isPending}
            sx={{ minWidth: 160 }}
          >
            Check payslip
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity='error'>
          {error.response?.data.detail ??
            'Could not load payslip for this period'}
        </Alert>
      )}

      {payslip && (
        <Paper
          sx={{
            border: '1px solid #e6ebf5',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              bgcolor: '#eef3fb',
              borderBottom: '1px solid #e6ebf5',
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {payrollMonthLabel(payslip.month)} {payslip.year}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
              {currentUser?.fullName ?? payslip.employeeFullName}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Earnings
            </Typography>
            {lineRow('Base salary', money(payslip.baseSalaryPounds))}
            {lineRow('Allowances', money(payslip.allowancesPounds))}
            {lineRow('Gross pay', money(payslip.grossPounds), true)}

            <Divider sx={{ my: 2 }} />

            <Typography
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Deductions
            </Typography>
            {lineRow('Income tax', money(payslip.incomeTaxPounds))}
            {lineRow('Social insurance', money(payslip.socialInsurancePounds))}

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: '#e7f6ec',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#1e7a3a' }}>
                Net pay
              </Typography>
              <Typography
                sx={{ fontWeight: 700, color: '#1e7a3a', fontSize: '1.25rem' }}
              >
                {money(payslip.netPounds)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Stack>
  );
};
