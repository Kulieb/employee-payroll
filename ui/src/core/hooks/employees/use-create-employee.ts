import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import { createEmployee } from '../../../api';
import type { ApiDetails, CreateEmployeePayload, Employee } from '../../../model';

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Employee,
    AxiosError<ApiDetails>,
    CreateEmployeePayload
  >({
    mutationFn: (payload) =>
      createEmployee(payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      enqueueSnackbar('Employee added successfully.', { variant: 'success' });
    },
  });

  return { ...mutation, create: mutation.mutate };
};
