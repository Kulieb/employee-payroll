import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import { deleteEmployee } from '../../../api';
import type { ApiDetails } from '../../../model';

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { message: string },
    AxiosError<ApiDetails>,
    number
  >({
    mutationFn: (id) => deleteEmployee(id).then((response) => response.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      enqueueSnackbar(response.message, { variant: 'success' });
    },
  });

  return { ...mutation, remove: mutation.mutate };
};
