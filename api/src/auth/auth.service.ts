import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { EmployeeStatus, Role as DbRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Role } from '../employee/dto/employee.dto';
import { type AuthUser } from './auth.controller';
import { AuthUserDto, LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const hrEmail = this.configService.getOrThrow<string>('HR_EMAIL').trim();
    const existing = await this.prisma.employee.findUnique({
      where: { email: hrEmail },
    });
    if (existing) {
      return;
    }

    const hrPassword = this.configService.getOrThrow<string>('HR_PASSWORD');
    if (!hrEmail || hrPassword.trim().length < 12) {
      throw new Error(
        'HR_EMAIL is required and HR_PASSWORD must have at least 12 characters',
      );
    }

    const created = await this.prisma.employee.create({
      data: {
        fullName: 'Interface HR',
        email: hrEmail,
        passwordHash: await hash(hrPassword, 10),
        role: DbRole.HR,
        jobTitle: 'HR',
        department: 'Human Resources',
        hireDate: new Date('2026-01-01'),
        baseMonthlySalary: 1,
        status: EmployeeStatus.active,
      },
    });
    await this.prisma.employee.update({
      where: { id: created.id },
      data: { createdBy: String(created.id) },
    });
  }

  async login(payload: LoginDto): Promise<{
    accessToken: string;
    user: AuthUserDto;
  }> {
    const employee = await this.prisma.employee.findUnique({
      where: { email: payload.email },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(
      employee.id,
      employee.fullName,
      employee.email,
      employee.passwordHash,
      payload.password,
      employee.role,
    );
  }

  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }

  async me(user: AuthUser): Promise<AuthUserDto> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: user.id },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role === DbRole.HR ? Role.HR : Role.EMPLOYEE,
    };
  }

  private async issueToken(
    id: number,
    fullName: string,
    email: string,
    passwordHash: string,
    password: string,
    role: JwtPayload['role'],
  ) {
    const passwordMatches = await compare(password, passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: id,
      email,
      role,
    });

    return {
      accessToken,
      user: {
        id,
        fullName,
        email,
        role: role === DbRole.HR ? Role.HR : Role.EMPLOYEE,
      },
    };
  }
}
