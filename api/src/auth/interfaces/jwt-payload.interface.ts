export interface JwtPayload {
  sub: number;
  email: string;
  role: 'HR' | 'EMPLOYEE';
}
