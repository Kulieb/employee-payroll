import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { getMe } from '../../../api';
import type { ApiDetails, AuthUser } from '../../../model';

export const useCurrentUser = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('accessToken');

  const query = useQuery<AuthUser, AxiosError<ApiDetails>>({
    queryKey: ['me'],
    queryFn: () => getMe().then((response) => response.data),
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (query.error?.response?.status !== 401) {
      return;
    }

    localStorage.removeItem('accessToken');
    queryClient.removeQueries({ queryKey: ['me'] });
  }, [query.error, queryClient]);

  return { ...query, currentUser: query.data };
};
