import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxDate,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmployeeMetaDto } from './employee-meta.dto';

const trimText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export enum Role {
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
}

export const EmployeeStatus = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type EmployeeStatus =
  (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const EMPLOYEE_STATUS_RESPONSE: Record<
  EmployeeStatus,
  EmployeeStatusDto
> = {
  [EmployeeStatus.active]: {
    value: EmployeeStatus.active,
    display: 'Active',
  },
  [EmployeeStatus.inactive]: {
    value: EmployeeStatus.inactive,
    display: 'Inactive',
  },
};

export class EmployeeStatusDto {
  @ApiProperty({
    description: 'Status value',
    enum: EmployeeStatus,
    example: EmployeeStatus.active,
  })
  @IsEnum(EmployeeStatus)
  value: EmployeeStatus;

  @ApiProperty({
    description: 'Status display text',
    example: 'Active',
  })
  @IsString()
  @IsNotEmpty()
  display: string;
}

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee full name',
    example: 'Jane Doe',
    maxLength: 100,
    type: String,
  })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'jane.doe@example.com',
    type: String,
  })
  @Transform(trimText)
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password. At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a symbol.',
    example: 'Abcd@123',
    minLength: 8,
    format: 'password',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Accountant',
    type: String,
  })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({
    description: 'Department',
    example: 'Finance',
    type: String,
  })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Hire date. Cannot be in the future.',
    example: '2026-01-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @MaxDate(() => new Date(new Date().setHours(23, 59, 59, 999)))
  hireDate: Date;

  @ApiProperty({
    description: 'Base monthly salary in whole Egyptian pounds',
    example: 5000,
    minimum: 1,
    type: Number,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value,
  )
  @IsInt()
  @Min(1)
  baseMonthlySalary: number;

  @ApiProperty({
    description: 'Employment status',
    enum: EmployeeStatus,
    example: EmployeeStatus.active,
  })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['password'] as const),
  { skipNullProperties: false },
) {}

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Employee full name',
    example: 'Jane Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Employee role',
    enum: Role,
    example: Role.EMPLOYEE,
  })
  role: Role;

  @ApiProperty({
    description: 'Job title',
    example: 'Accountant',
  })
  jobTitle: string;

  @ApiProperty({
    description: 'Department',
    example: 'Finance',
  })
  department: string;

  @ApiProperty({
    description: 'Hire date',
    example: '2026-01-15T00:00:00.000Z',
  })
  hireDate: string;

  @ApiProperty({
    description: 'Base monthly salary in whole Egyptian pounds',
    example: 5000,
  })
  baseMonthlySalary: number;

  @ApiProperty({
    description: 'Employment status',
    type: EmployeeStatusDto,
  })
  @ValidateNested()
  @Type(() => EmployeeStatusDto)
  status: EmployeeStatusDto;

  @ApiProperty({
    description: 'Created and updated metadata',
    type: EmployeeMetaDto,
  })
  @ValidateNested()
  @Type(() => EmployeeMetaDto)
  meta: EmployeeMetaDto;
}

export class DeleteEmployeeResponseDto {
  @ApiProperty({
    description: 'Deletion result',
    example: 'Employee deleted successfully',
  })
  message: string;
}
