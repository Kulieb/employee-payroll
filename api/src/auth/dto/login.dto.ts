import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../employee/dto/employee.dto';

export class LoginDto {
  @ApiProperty({
    example: 'hr@interface.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Interface HR' })
  fullName: string;

  @ApiProperty({ example: 'hr@interface.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.HR })
  role: Role;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout result',
    example: 'Logged out successfully',
  })
  message: string;
}
