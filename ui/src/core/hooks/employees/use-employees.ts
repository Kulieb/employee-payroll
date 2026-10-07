import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { listEmployees } from '../../../api';
import type { ApiDetails, Employee } from '../../../model';

export const useEmployees = () => {
  const token = localStorage.getItem('accessToken');

  const query = useQuery<Employee[], AxiosError<ApiDetails>>({
    queryKey: ['employees'],
    queryFn: () => listEmployees().then((response) => response.data),
    enabled: Boolean(token),
  });

  return { ...query, employees: query.data };
};
