import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, useState } from 'react';
import { CalculateSalaryDialog } from '../components/calculate-salary-dialog';
import { usePayslipCalculations } from '../core/hooks/payroll';
import { payrollMonthLabel } from '../core/constants/payroll-months';

const cellSx = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: '0.875rem',
  lineHeight: '1.375rem',
  letterSpacing: 0,
  color: 'text.primary',
  borderColor: '#e6ebf5',
};

const money = (pounds: number) => `EGP ${pounds.toLocaleString('en-US')}`;

export const SalaryCalculationsPage = () => {
  const { calculations, isLoading, error } = usePayslipCalculations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (key: string) => {
    setOpenRows((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h5'>Calculate Employees Salary</Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Calculate salary
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color='error'>
          {error.response?.data.detail ?? 'Could not load salary calculations'}
        </Typography>
      )}
      {!isLoading && !error && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#eef3fb' }}>
                <TableCell sx={{ ...cellSx, width: 48 }} />
                <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Month</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Year</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: 700 }}>
                  Number of employees
                </TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: 700 }}>
                  Created by
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 700 }}
                  title='When the first payslip for this period was created'
                >
                  Created at
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(calculations ?? []).map((row) => {
                const key = `${row.year}-${row.month}`;
                const expanded = Boolean(openRows[key]);
                const creators = [
                  ...new Set(
                    row.employees.map(
                      (employee) =>
                        employee.createdBy?.name ??
                        employee.createdBy?.email ??
                        'Unknown',
                    ),
                  ),
                ].join(', ');
                return (
                  <Fragment key={key}>
                    <TableRow>
                      <TableCell sx={cellSx}>
                        <IconButton
                          size='small'
                          aria-label={`${expanded ? 'Collapse' : 'Expand'} payslips for ${payrollMonthLabel(row.month)} ${row.year}`}
                          aria-expanded={expanded}
                          onClick={() => toggleRow(key)}
                        >
                          {expanded ? (
                            <KeyboardArrowDownIcon />
                          ) : (
                            <KeyboardArrowRightIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {payrollMonthLabel(row.month)}
                      </TableCell>
                      <TableCell sx={cellSx}>{row.year}</TableCell>
                      <TableCell sx={cellSx}>{row.employeeCount}</TableCell>
                      <TableCell sx={cellSx}>{creators}</TableCell>
                      <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                        {new Date(row.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                        <Collapse in={expanded} timeout='auto' unmountOnExit>
                          <TableContainer sx={{ py: 1.5 }}>
                            <Table
                              size='small'
                              aria-label={`Payslips for ${payrollMonthLabel(row.month)} ${row.year}`}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell>Employee</TableCell>
                                  <TableCell align='right'>
                                    Base salary
                                  </TableCell>
                                  <TableCell align='right'>
                                    Allowances
                                  </TableCell>
                                  <TableCell align='right'>Gross pay</TableCell>
                                  <TableCell align='right'>
                                    Income tax
                                  </TableCell>
                                  <TableCell align='right'>
                                    Social insurance
                                  </TableCell>
                                  <TableCell align='right'>Net pay</TableCell>
                                  <TableCell>Created by</TableCell>
                                  <TableCell>Created at</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.employees.map((employee) => (
                                  <TableRow key={employee.id}>
                                    <TableCell component='th' scope='row'>
                                      {employee.fullName}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {money(employee.baseSalaryPounds)}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {money(employee.allowancesPounds)}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {money(employee.grossPounds)}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {money(employee.incomeTaxPounds)}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {money(employee.socialInsurancePounds)}
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {money(employee.netPounds)}
                                    </TableCell>
                                    <TableCell>
                                      {employee.createdBy?.name ??
                                        employee.createdBy?.email ??
                                        'Unknown'}
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                      {new Date(
                                        employee.createdAt,
                                      ).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
              {(calculations ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={cellSx}>
                    No salary calculations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
      <CalculateSalaryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode='multiple'
      />
    </>
  );
};
