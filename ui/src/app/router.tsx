import { createBrowserRouter } from 'react-router-dom';
import {
  HomePageWrapper,
  LoginPage,
  NotFoundPage,
  SalaryCalculationsPage,
} from '../pages';
import { AppShell } from '../components/app-shell';
import { Role } from '../model';
import { RoleGuard } from './role-guard';
import { Root } from './root';
export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/login', element: <LoginPage />, handle: { title: 'Login' } },
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            element: <HomePageWrapper />,
            handle: { title: 'Home' },
          },
          {
            path: '/salary-calculations',
            element: (
              <RoleGuard allowedRoles={[Role.HR]}>
                <SalaryCalculationsPage />
              </RoleGuard>
            ),
            handle: { title: 'Calculate Employees Salary' },
          },
        ],
      },
      { path: '*', element: <NotFoundPage />, handle: { title: 'Not found' } },
    ],
  },
]);
