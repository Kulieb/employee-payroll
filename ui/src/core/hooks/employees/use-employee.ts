import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getEmployee } from '../../../api';
import type { ApiDetails, Employee } from '../../../model';

export const useEmployee = (id: number | null) => {
  const token = localStorage.getItem('accessToken');

  const query = useQuery<Employee, AxiosError<ApiDetails>>({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id as number).then((response) => response.data),
    enabled: Boolean(token) && id !== null,
  });

  return { ...query, employee: query.data };
};
