import { useMutation } from '@tanstack/react-query';
import { login } from '../../../api';
import type { ApiDetails, LoginPayload, LoginResponse } from '../../../model';
import type { AxiosError } from 'axios';

export const useLogin = () => {
  const loginMutation = useMutation<
    LoginResponse,
    AxiosError<ApiDetails>,
    LoginPayload
  >({
    mutationFn: (payload) => login(payload).then((response) => response.data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
    },
  });

  return { ...loginMutation, login: loginMutation.mutate };
};
