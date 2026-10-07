import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useCalculatePayslips } from '../core/hooks/payroll/use-calculate-payslips';
import { useEmployees } from '../core/hooks/employees';
import type { Employee } from '../model';
import { PAYROLL_MONTHS } from '../core/constants/payroll-months';

type CalculateSalaryDialogProps = {
  open: boolean;
  onClose: () => void;
  mode: 'single' | 'multiple';
  employee?: Employee | null;
};

export const CalculateSalaryDialog = ({
  open,
  onClose,
  mode,
  employee,
}: CalculateSalaryDialogProps) => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const { employees } = useEmployees();
  const { calculate, isPending, isSuccess, error, reset } =
    useCalculatePayslips();

  const employeeOptions = useMemo(() => employees ?? [], [employees]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const date = new Date();
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    reset();
  }, [open, mode, reset]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
      reset();
    }
  }, [isSuccess, onClose, reset]);

  const employeeIds =
    mode === 'single'
      ? employee
        ? [employee.id]
        : []
      : selectedEmployees.map((item) => item.id);

  const submit = () => {
    if (employeeIds.length === 0) {
      return;
    }

    calculate({ year, month, employeeIds });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Calculate salary</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {mode === 'single' && employee && (
            <Typography>Employee: {employee.fullName}</Typography>
          )}
          <TextField
            select
            label='Month'
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            fullWidth
          >
            {PAYROLL_MONTHS.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label='Year'
            type='number'
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            fullWidth
            slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
          />
          {mode === 'multiple' && (
            <Autocomplete
              multiple
              options={employeeOptions}
              value={selectedEmployees}
              onChange={(_, value) => setSelectedEmployees(value)}
              getOptionLabel={(option) => option.fullName}
              isOptionEqualToValue={(left, right) => left.id === right.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Employees'
                  placeholder={
                    selectedEmployees.length === 0
                      ? 'Select employees'
                      : undefined
                  }
                />
              )}
            />
          )}
          {error && (
            <Alert severity='error'>
              {error.response?.data.detail ?? 'Could not calculate salary'}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant='contained'
          onClick={submit}
          disabled={isPending || employeeIds.length === 0}
        >
          Calculate
        </Button>
      </DialogActions>
    </Dialog>
  );
};
