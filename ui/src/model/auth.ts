export enum Role {
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
}

export interface AuthUser {
  id: number;
  fullName: string | null;
  email: string | null;
  role: Role | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}
