import { Box, CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import type { Role } from '../model';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: readonly Role[];
};

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser?.role || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to='/' replace />;
  }

  return children;
};
