import { ApiProperty } from '@nestjs/swagger';
import { NestedMetaUserDto } from '../../employee/dto/employee-meta.dto';

export class PayslipResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  employeeId: number;

  @ApiProperty({ example: 'Jane Doe' })
  employeeFullName: string;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 3 })
  month: number;

  @ApiProperty({ example: 10_000 })
  baseSalaryPounds: number;

  @ApiProperty({ example: 1_500 })
  allowancesPounds: number;

  @ApiProperty({ example: 11_500 })
  grossPounds: number;

  @ApiProperty({ example: 1_450 })
  incomeTaxPounds: number;

  @ApiProperty({ example: 1_100 })
  socialInsurancePounds: number;

  @ApiProperty({ example: 8_950 })
  netPounds: number;

  @ApiProperty({ format: 'date-time', example: '2026-10-07T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ type: NestedMetaUserDto, nullable: true })
  createdBy: NestedMetaUserDto | null;
}
