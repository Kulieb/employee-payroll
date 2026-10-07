import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { type AuthUser } from '../auth/auth.controller';
import { CurrentUser, Roles } from '../auth/decorators/auth.decorators';
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
import {
  CreateEmployeeDto,
  DeleteEmployeeResponseDto,
  EmployeeResponseDto,
  UpdateEmployeeDto,
} from './dto/employee.dto';
import { EmployeeService } from './employee.service';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HR')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List employees',
    description: 'Returns every employee. The HR account is not included.',
  })
  @ApiStandardResponse(EmployeeResponseDto, {
    description: 'Employees retrieved successfully',
    isArray: true,
  })
  @ApiUnauthorized()
  @ApiForbidden()
  async listEmployees(): Promise<EmployeeResponseDto[]> {
    return await this.employeeService.listEmployees();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get an employee',
    description: 'Returns one employee by id, including role and meta.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the employee',
    example: 1,
    type: Number,
  })
  @ApiStandardResponse(EmployeeResponseDto, {
    description: 'Employee retrieved successfully',
  })
  @ApiBadRequest({
    description: 'Invalid employee id',
    exampleMessage: 'Validation failed (numeric string is expected)',
  })
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiNotFound({
    description: 'Employee not found',
    exampleMessage: 'Employee not found',
  })
  async employeeDetails(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmployeeResponseDto> {
    return await this.employeeService.employeeDetails(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create an employee',
    description:
      'Creates an employee from the form. The password is hashed before it is stored. Role defaults to employee. createdBy is the logged-in user. updatedAt and updatedBy stay empty.',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Employee form data',
  })
  @ApiStandardResponse(EmployeeResponseDto, {
    status: 201,
    description: 'Employee created successfully',
  })
  @ApiBadRequest({
    description: 'Invalid employee data or missing required fields',
    exampleMessage: 'Invalid input data',
  })
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiConflict({
    description: 'Email already exists',
    exampleMessage: 'Email already exists',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createEmployee(
    @Body() payload: CreateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<EmployeeResponseDto> {
    return await this.employeeService.createEmployee(payload, user);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an employee',
    description:
      'Updates an existing employee by id. Password is not accepted. createdAt and createdBy stay as they were. updatedBy is the logged-in user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the employee to update',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Employee fields to update',
  })
  @ApiStandardResponse(EmployeeResponseDto, {
    description: 'Employee updated successfully',
  })
  @ApiBadRequest({
    description: 'Invalid employee id or employee data',
    exampleMessage: 'Invalid input data',
  })
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiNotFound({
    description: 'Employee not found',
    exampleMessage: 'Employee not found',
  })
  @ApiConflict({
    description: 'Email already exists',
    exampleMessage: 'Email already exists',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<EmployeeResponseDto> {
    return await this.employeeService.updateEmployee(id, payload, user);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete an employee',
    description: 'Deletes an employee by id.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the employee to delete',
    example: 1,
    type: Number,
  })
  @ApiStandardResponse(DeleteEmployeeResponseDto, {
    description: 'Employee deleted successfully',
  })
  @ApiBadRequest({
    description: 'Invalid employee id',
    exampleMessage: 'Validation failed (numeric string is expected)',
  })
  @ApiUnauthorized()
  @ApiForbidden()
  @ApiNotFound({
    description: 'Employee not found',
    exampleMessage: 'Employee not found',
  })
  async deleteEmployee(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteEmployeeResponseDto> {
    return await this.employeeService.deleteEmployee(id);
  }
}
