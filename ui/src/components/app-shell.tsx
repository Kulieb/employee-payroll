import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  SnackbarProvider,
  type SnackbarKey,
  useSnackbar,
} from 'notistack';
import { useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from 'react-router-dom';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import { useLogout } from '../core/hooks/auth/use-logout';
import { homeTitle } from '../pages/home-title';
import { Role } from '../model';

const greeting = () =>
  new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

const SnackbarCloseButton = ({ snackbarKey }: { snackbarKey?: SnackbarKey }) => {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton
      onClick={() => closeSnackbar(snackbarKey)}
      size='small'
      aria-label='Close notification'
    >
      <CloseIcon fontSize='small' />
    </IconButton>
  );
};

export const AppShell = () => {
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useCurrentUser();
  const { logout, isPending: isLoggingOut } = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const matches = useMatches();
  const routeTitle = [...matches]
    .reverse()
    .map((match) => (match.handle as { title?: string } | undefined)?.title)
    .find(Boolean);
  const pageTitle =
    location.pathname === '/' ? homeTitle(currentUser?.role) : routeTitle;

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  const closeDrawer = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const name = currentUser?.fullName ?? '';
  const isHr = currentUser?.role === Role.HR;

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={8000}
      action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}
    >
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position='sticky'
        sx={{
          backgroundColor: 'primary.main',
          backgroundImage:
            'linear-gradient(90deg, #1f47a0 0%, #1f47a0 70%, #8eb0e8 100%)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: 80,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isHr && (
              <IconButton
                color='inherit'
                edge='start'
                aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
                onClick={() => setDrawerOpen((open) => !open)}
              >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
            <Typography
              component='p'
              sx={{
                m: 0,
                color: '#ffffff !important',
                fontWeight: 700,
                fontSize: '1.125rem',
                lineHeight: '1.375rem',
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
          <Typography
            component='p'
            sx={{
              justifySelf: 'center',
              m: 0,
              color: '#ffffff !important',
              fontWeight: 700,
              fontSize: '1.125rem',
              lineHeight: '1.375rem',
            }}
          >
            {greeting()}, {name}
          </Typography>
          <IconButton
            color='inherit'
            aria-label='Account'
            sx={{ justifySelf: 'end' }}
            onClick={(event) => setAccountAnchor(event.currentTarget)}
          >
            <PersonIcon />
          </IconButton>
          <Menu
            anchorEl={accountAnchor}
            open={Boolean(accountAnchor)}
            onClose={() => setAccountAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                {name}
              </Typography>
              <Typography
                sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
              >
                {currentUser?.email}
              </Typography>
            </Box>
            <MenuItem
              disabled={isLoggingOut}
              onClick={() => {
                setAccountAnchor(null);
                logout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {isHr && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              pt: 2,
            }}
          >
            <Box
              component='img'
              src='/logo.png'
              alt='Interface'
              sx={{ height: 36 }}
            />
            <IconButton
              aria-label='Close navigation'
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ width: 240 }}>
            <ListItemButton onClick={() => closeDrawer('/')}>
              <ListItemText primary={homeTitle(currentUser?.role)} />
            </ListItemButton>
            <ListItemButton onClick={() => closeDrawer('/salary-calculations')}>
              <ListItemText primary='Calculate Employees Salary' />
            </ListItemButton>
          </List>
        </Drawer>
      )}
      <Box component='main' sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
    </SnackbarProvider>
  );
};
