import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import { updateEmployee } from '../../../api';
import type { ApiDetails, Employee, UpdateEmployeePayload } from '../../../model';

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Employee,
    AxiosError<ApiDetails>,
    { id: number; payload: UpdateEmployeePayload }
  >({
    mutationFn: ({ id, payload }) =>
      updateEmployee(id, payload).then((response) => response.data),
    onSuccess: (_employee, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      enqueueSnackbar('Employee updated successfully.', { variant: 'success' });
    },
  });

  return { ...mutation, update: mutation.mutate };
};
