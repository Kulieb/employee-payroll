import { ApiProperty, PickType } from '@nestjs/swagger';
import { PayslipResponseDto } from './payslip-response.dto';

export class PayslipCalculationEmployeeDto extends PickType(
  PayslipResponseDto,
  [
    'baseSalaryPounds',
    'allowancesPounds',
    'grossPounds',
    'incomeTaxPounds',
    'socialInsurancePounds',
    'netPounds',
    'createdAt',
    'createdBy',
  ] as const,
) {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;
}

export class PayslipCalculationListItemDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 3 })
  month: number;

  @ApiProperty({ example: 2 })
  employeeCount: number;

  @ApiProperty({
    description: 'When the first payslip for this period was created',
    format: 'date-time',
    example: '2026-10-07T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({ type: [PayslipCalculationEmployeeDto] })
  employees: PayslipCalculationEmployeeDto[];
}
