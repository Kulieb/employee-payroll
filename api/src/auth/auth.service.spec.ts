import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { AuthService } from './auth.service';
import type { PrismaService } from '../infrastructure/prisma/prisma.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('@nestjs/jwt', () => ({ JwtService: class {} }));
jest.mock('../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class {},
}));
jest.mock(
  '../generated/prisma/enums.js',
  () => ({
    Role: { HR: 'HR', EMPLOYEE: 'EMPLOYEE' },
    EmployeeStatus: { active: 'active', inactive: 'inactive' },
  }),
  { virtual: true },
);

describe('initial HR account', () => {
  const employee = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const password = 'Test-only-password-123!';
  const service = (values: Record<string, string>) =>
    new AuthService(
      { employee } as unknown as PrismaService,
      {} as JwtService,
      {
        getOrThrow: (key: string) => {
          if (values[key] === undefined) throw new Error(`Missing ${key}`);
          return values[key];
        },
      } as unknown as ConfigService,
    );

  beforeEach(() => jest.resetAllMocks());

  it('creates the configured account with a hashed password', async () => {
    employee.findUnique.mockResolvedValue(null);
    employee.create.mockResolvedValue({ id: 7 });
    await service({
      HR_EMAIL: 'admin@example.com',
      HR_PASSWORD: password,
    }).onModuleInit();
    expect(employee.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
    const calls = employee.create.mock.calls as Array<
      [{ data: { email: string; passwordHash: string; role: string } }]
    >;
    const data = calls[0][0].data;
    expect(data.email).toBe('admin@example.com');
    expect(data.role).toBe('HR');
    expect(data.passwordHash).not.toBe(password);
    expect(await compare(password, data.passwordHash)).toBe(true);
    expect(employee.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { createdBy: '7' },
    });
  });

  it('preserves an existing account without needing the seed password', async () => {
    employee.findUnique.mockResolvedValue({ id: 7 });
    await service({ HR_EMAIL: 'admin@example.com' }).onModuleInit();
    expect(employee.create).not.toHaveBeenCalled();
    expect(employee.update).not.toHaveBeenCalled();
  });

  it('rejects missing initial credentials without writing an account', async () => {
    employee.findUnique.mockResolvedValue(null);
    await expect(
      service({ HR_EMAIL: 'admin@example.com' }).onModuleInit(),
    ).rejects.toThrow('HR_PASSWORD');
    expect(employee.create).not.toHaveBeenCalled();
  });

  it('rejects a short initial password', async () => {
    employee.findUnique.mockResolvedValue(null);
    await expect(
      service({
        HR_EMAIL: 'admin@example.com',
        HR_PASSWORD: 'short',
      }).onModuleInit(),
    ).rejects.toThrow('12 characters');
    expect(employee.create).not.toHaveBeenCalled();
  });
});
