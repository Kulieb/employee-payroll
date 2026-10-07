import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../auth/decorators/auth.decorators';
import { type AuthUser } from '../auth/auth.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBadRequest,
  ApiConflict,
  ApiForbidden,
  ApiNotFound,
  ApiStandardResponse,
  ApiUnauthorized,
} from '../common/decorators/api-standard-responses.decorator';
import { CalculatePayslipsDto } from './dto/calculate-payslips.dto';
import { GetMyPayslipQueryDto } from './dto/get-my-payslip-query.dto';
import { PayslipCalculationListItemDto } from './dto/payslip-calculation-list.dto';
import { PayslipResponseDto } from './dto/payslip-response.dto';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('me/payslip')
  @HttpCode(200)
  @Roles('EMPLOYEE')
  @ApiOperation({
    summary: 'My payslip',
    description:
      'Returns the stored payslip for the signed-in employee for the given month and year.',
  })
  @ApiStandardResponse(PayslipResponseDto, {
    description: 'Payslip retrieved successfully',
  })
  @ApiBadRequest()
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiNotFound({
    description: 'No payslip for this period',
    exampleMessage: 'No payslip found for 3/2026',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMyPayslip(
    @CurrentUser() user: AuthUser,
    @Query() query: GetMyPayslipQueryDto,
  ): Promise<PayslipResponseDto> {
    return await this.payrollService.getMyPayslip(
      user.id,
      query.year,
      query.month,
    );
  }

  @Post('calculations')
  @Roles('HR')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Calculate and store payslips',
    description:
      'Calculates payslips for one or more employees for a month and year, then stores them. Returns a conflict if any employee already has a payslip for that period.',
  })
  @ApiBody({ type: CalculatePayslipsDto })
  @ApiStandardResponse(PayslipResponseDto, {
    status: 201,
    description: 'Payslips calculated successfully',
    isArray: true,
  })
  @ApiBadRequest()
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiNotFound()
  @ApiConflict({
    description: 'Employee already has a payslip for this period',
    exampleMessage:
      'Employee Jane Doe already has salary calculated for month 3 and year 2026',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async calculatePayslips(
    @Body() payload: CalculatePayslipsDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PayslipResponseDto[]> {
    return await this.payrollService.calculatePayslips(payload, user);
  }

  @Get('calculations')
  @HttpCode(200)
  @Roles('HR')
  @ApiOperation({
    summary: 'List calculated payslips',
    description:
      'Returns calculated payslips grouped by month and year with employee names and stored payslip amounts.',
  })
  @ApiStandardResponse(PayslipCalculationListItemDto, {
    description: 'Payslip calculations retrieved successfully',
    isArray: true,
  })
  @ApiUnauthorized()
  @ApiForbidden()
  async listCalculations(): Promise<PayslipCalculationListItemDto[]> {
    return await this.payrollService.listCalculations();
  }
}
