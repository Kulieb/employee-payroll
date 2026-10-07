import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FormTextField } from '../api/components/form-text-field';
import { useLogin } from '../core/hooks/auth/use-login';
import type { LoginPayload } from '../model';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const schema = yup.object({
  email: yup.string().email().required().label('Email'),
  password: yup.string().required().label('Password'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isPending: isLoggingIn, error: loginError } = useLogin();
  const { currentUser, isLoading: currentUserLoading } = useCurrentUser();

  const form = useForm<LoginPayload>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginPayload> = (data) => {
    login(data);
  };

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eef3fb',
          backgroundImage:
            'radial-gradient(circle at 30% 40%, #d5e2f6 0%, #eef3fb 55%)',
        }}
      >
        <Box
          component='img'
          src='/logo.png'
          alt='Interface'
          sx={{ width: 280, maxWidth: '70%' }}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <FormProvider {...form}>
          <Stack
            component='form'
            noValidate
            spacing={2}
            onSubmit={form.handleSubmit(onSubmit)}
            sx={{ width: '100%', maxWidth: 360 }}
          >
            <Typography variant='h4' sx={{ textAlign: 'center' }}>
              Welcome Back!
            </Typography>
            <FormTextField name='email' label='Email' required />
            <FormTextField
              name='password'
              label='Password'
              type='password'
              required
            />
            {loginError && (
              <Alert severity='error'>
                {loginError.response?.data.detail ??
                  'Invalid email or password'}
              </Alert>
            )}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={isLoggingIn || currentUserLoading}
            >
              Sign in
            </Button>
          </Stack>
        </FormProvider>
      </Box>
    </Box>
  );
}
