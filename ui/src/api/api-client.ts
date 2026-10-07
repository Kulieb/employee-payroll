import { api } from './axios';
import { apiUrls } from './api-urls';
import type {
  AuthUser,
  CreateEmployeePayload,
  Employee,
  LoginPayload,
  LoginResponse,
  CalculatePayslipsPayload,
  Payslip,
  PayslipCalculationListItem,
  UpdateEmployeePayload,
} from '../model';

export const login = (payload: LoginPayload) => {
  const { url, method } = apiUrls.auth.login;
  return api.request<LoginResponse>({ url, method, data: payload });
};

export const logout = () => {
  const { url, method } = apiUrls.auth.logout;
  return api.request<{ message: string }>({ url, method });
};

export const getMe = () => {
  const { url, method } = apiUrls.auth.me;
  return api.request<AuthUser>({ url, method });
};

export const listEmployees = () => {
  const { url, method } = apiUrls.employees;
  return api.request<Employee[]>({ url, method });
};

export const getEmployee = (id: number) => {
  const { method } = apiUrls.employee;
  return api.request<Employee>({ url: `/employees/${id}`, method });
};

export const createEmployee = (payload: CreateEmployeePayload) => {
  const { url, method } = apiUrls.createEmployee;
  return api.request<Employee>({ url, method, data: payload });
};

export const updateEmployee = (id: number, payload: UpdateEmployeePayload) => {
  const { method } = apiUrls.updateEmployee;
  return api.request<Employee>({
    url: `/employees/${id}`,
    method,
    data: payload,
  });
};

export const listPayslipCalculations = () => {
  const { url, method } = apiUrls.payslipCalculations;
  return api.request<PayslipCalculationListItem[]>({ url, method });
};

export const calculatePayslips = (payload: CalculatePayslipsPayload) => {
  const { url, method } = apiUrls.calculatePayslips;
  return api.request<Payslip[]>({ url, method, data: payload });
};

export const getMyPayslip = (year: number, month: number) => {
  const { url, method } = apiUrls.myPayslip;
  return api.request<Payslip>({ url, method, params: { year, month } });
};

export const deleteEmployee = (id: number) => {
  const { method } = apiUrls.deleteEmployee;
  return api.request<{ message: string }>({
    url: `/employees/${id}`,
    method,
  });
};
