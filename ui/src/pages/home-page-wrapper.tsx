import { Box, CircularProgress, Typography } from '@mui/material';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import { Role } from '../model';
import { EmployeePage } from './employee-page';
import { AdminDashboardPage } from './admin-dashboard-page';

export const HomePageWrapper = () => {
  const { currentUser, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentUser?.role === Role.HR) {
    return <AdminDashboardPage />;
  }

  if (currentUser?.role === Role.EMPLOYEE) {
    return <EmployeePage />;
  }

  if (error) {
    return (
      <Typography color='error'>
        {error.response?.data.detail ?? 'Failed to load your account'}
      </Typography>
    );
  }

  return null;
};
