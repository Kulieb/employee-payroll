import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import { calculatePayslips } from '../../../api';
import type { ApiDetails, CalculatePayslipsPayload, Payslip } from '../../../model';

export const useCalculatePayslips = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    Payslip[],
    AxiosError<ApiDetails>,
    CalculatePayslipsPayload
  >({
    mutationFn: (payload) =>
      calculatePayslips(payload).then((response) => response.data),
    onSuccess: (payslips) => {
      queryClient.invalidateQueries({ queryKey: ['payslip-calculations'] });
      const message =
        payslips.length === 1
          ? 'Salary calculated successfully.'
          : `Salary calculated successfully for ${payslips.length} employees.`;
      enqueueSnackbar(message, { variant: 'success' });
    },
  });

  return {
    ...mutation,
    calculate: mutation.mutate,
  };
};
