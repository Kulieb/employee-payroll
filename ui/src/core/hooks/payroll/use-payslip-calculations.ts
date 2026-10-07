import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { listPayslipCalculations } from '../../../api';
import type { ApiDetails, PayslipCalculationListItem } from '../../../model';

export const usePayslipCalculations = () => {
  const token = localStorage.getItem('accessToken');

  const query = useQuery<PayslipCalculationListItem[], AxiosError<ApiDetails>>({
    queryKey: ['payslip-calculations'],
    queryFn: () =>
      listPayslipCalculations().then((response) => response.data),
    enabled: Boolean(token),
  });

  return { ...query, calculations: query.data };
};
