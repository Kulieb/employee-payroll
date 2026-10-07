import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NestedMetaUserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '1',
    type: String,
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    description: 'Name of the user who performed the action',
    type: String,
    nullable: true,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({
    description: 'Email of the user who performed the action',
    type: String,
    nullable: true,
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string | null;
}

export class EmployeeMetaDto {
  @ApiProperty({
    description: 'When the employee was created',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'When the employee was last updated',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  updatedAt: Date | null;

  @ApiProperty({
    description: 'Who created the employee. Null until login exists.',
    type: NestedMetaUserDto,
    nullable: true,
  })
  @ValidateNested()
  @Type(() => NestedMetaUserDto)
  createdBy: NestedMetaUserDto | null;

  @ApiPropertyOptional({
    description: 'Who last updated the employee',
    type: NestedMetaUserDto,
    nullable: true,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => NestedMetaUserDto)
  updatedBy?: NestedMetaUserDto | null;
}
