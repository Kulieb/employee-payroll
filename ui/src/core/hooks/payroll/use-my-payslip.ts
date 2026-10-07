import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getMyPayslip } from '../../../api';
import type { ApiDetails, Payslip } from '../../../model';

export type MyPayslipRequest = {
  year: number;
  month: number;
};

export const useMyPayslip = () => {
  const mutation = useMutation<Payslip, AxiosError<ApiDetails>, MyPayslipRequest>(
    {
      mutationFn: ({ year, month }) =>
        getMyPayslip(year, month).then((response) => response.data),
    },
  );

  return {
    ...mutation,
    checkPayslip: mutation.mutate,
    payslip: mutation.data,
  };
};
