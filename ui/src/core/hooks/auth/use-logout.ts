import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../api';
import type { ApiDetails } from '../../../model';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation<
    { message: string },
    AxiosError<ApiDetails>,
    void
  >({
    mutationFn: () => logout().then((response) => response.data),
    onSettled: () => {
      localStorage.removeItem('accessToken');
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  return { ...mutation, logout: mutation.mutate };
};
