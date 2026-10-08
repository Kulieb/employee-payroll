import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { CalculateSalaryDialog } from '../components/calculate-salary-dialog';
import { EmployeeTable } from '../components/employee-table';
import { EmployeeForm } from '../components/employee-form/employee-form';
import { useDeleteEmployee, useEmployees } from '../core/hooks/employees';
import type { Employee } from '../model';

export const AdminDashboardPage = () => {
  const { employees, isLoading, error } = useEmployees();
  const { remove } = useDeleteEmployee();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [salaryEmployee, setSalaryEmployee] = useState<Employee | null>(null);

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
        <Typography variant='h5'>Admin Dashboard</Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => {
            setFormMode('add');
            setSelectedEmployee(null);
            setFormOpen(true);
          }}
        >
          Add Employee
        </Button>
      </Box>
      <EmployeeTable
        employees={employees ?? []}
        isLoading={isLoading}
        error={
          error
            ? (error.response?.data.detail ?? 'Failed to load employees')
            : undefined
        }
        onEdit={(employee) => {
          setFormMode('edit');
          setSelectedEmployee(employee);
          setFormOpen(true);
        }}
        onDelete={(employee) => remove(employee.id)}
        onCalculateSalary={setSalaryEmployee}
      />
      <CalculateSalaryDialog
        open={Boolean(salaryEmployee)}
        onClose={() => setSalaryEmployee(null)}
        mode='single'
        employee={salaryEmployee}
      />
      <EmployeeForm
        key={`${formMode}-${selectedEmployee?.id ?? 'new'}`}
        open={formOpen}
        mode={formMode}
        employee={selectedEmployee}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
};
