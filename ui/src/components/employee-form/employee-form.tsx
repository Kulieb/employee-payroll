import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Drawer,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import {
  Controller,
  FormProvider,
  type Resolver,
  type SubmitHandler,
  useForm,
} from 'react-hook-form';
import { FormTextField } from '../../api/components/form-text-field';
import {
  useCreateEmployee,
  useUpdateEmployee,
} from '../../core/hooks/employees';
import type { Employee } from '../../model';
import { employeeFormDefaultValues } from './default-values';
import {
  createPayloadFromForm,
  employeeFormValuesFromEmployee,
  updatePayloadFromForm,
} from './mappers';
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from './validation-schema';

type EmployeeFormProps = {
  open: boolean;
  mode: 'add' | 'edit';
  employee?: Employee | null;
  onClose: () => void;
};

export const EmployeeForm = ({
  open,
  mode,
  employee,
  onClose,
}: EmployeeFormProps) => {
  const {
    create,
    isPending: isCreating,
    isSuccess: isCreated,
    error: createError,
    reset: resetCreate,
  } = useCreateEmployee();

  const {
    update,
    isPending: isUpdating,
    isSuccess: isUpdated,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    defaultValues: employeeFormDefaultValues,
    resolver: yupResolver(
      employeeFormSchema(mode),
    ) as Resolver<EmployeeFormValues>,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && employee) {
      form.reset(employeeFormValuesFromEmployee(employee));
      return;
    }
    form.reset(employeeFormDefaultValues);
  }, [open, mode, employee, form]);

  useEffect(() => {
    if (isCreated || isUpdated) {
      onClose();
      form.reset(employeeFormDefaultValues);
      resetCreate();
      resetUpdate();
    }
  }, [isCreated, isUpdated, onClose, form, resetCreate, resetUpdate]);

  const onSubmit: SubmitHandler<EmployeeFormValues> = (values) => {
    if (mode === 'edit' && employee) {
      update({ id: employee.id, payload: updatePayloadFromForm(values) });
      return;
    }
    create(createPayloadFromForm(values));
  };

  const error = mode === 'edit' ? updateError : createError;
  const isSaving = isCreating || isUpdating;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 720 },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <FormProvider {...form}>
        <Box
          component='form'
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            p: 3,
          }}
        >
          <Typography variant='h5' sx={{ mb: 3 }}>
            {mode === 'add' ? 'Add Employee' : 'Update Employee'}
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error.response?.data.detail ?? 'Could not save the employee'}
            </Alert>
          )}
          <Grid container columnSpacing={3} rowSpacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <FormTextField name='fullName' label='Full name' required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <FormTextField name='email' label='Email' required />
            </Grid>
            {mode === 'add' && (
              <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
                <FormTextField
                  name='password'
                  label='Password'
                  type='password'
                  required
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <FormTextField name='jobTitle' label='Job title' required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <FormTextField name='department' label='Department' required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <FormTextField
                name='hireDate'
                label='Hire date'
                type='date'
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name='baseMonthlySalary'
                label='Base monthly salary (EGP)'
                type='number'
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label='Status'
                    fullWidth
                    required
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 'auto',
              pt: 3,
            }}
          >
            <Button type='button' onClick={onClose}>
              Close
            </Button>
            <Button type='submit' variant='contained' disabled={isSaving}>
              Save
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Drawer>
  );
};
