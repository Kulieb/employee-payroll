import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiStandardResponse,
  ApiUnauthorized,
} from '../common/decorators/api-standard-responses.decorator';
import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CurrentUser } from './decorators/auth.decorators';
import {
  AuthUserDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
} from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export type AuthUser = {
  id: number;
  email: string;
  role: JwtPayload['role'];
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticates an employee and returns an access token.',
  })
  @ApiStandardResponse(LoginResponseDto, {
    description: 'Authenticated successfully',
  })
  @ApiBadRequest({
    description: 'Invalid email or password format',
    exampleMessage: 'email must be an email',
  })
  @ApiUnauthorized({
    description: 'Invalid email or password',
    exampleMessage: 'Invalid email or password',
  })
  login(@Body() payload: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(payload);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description:
      'Ends the current session. The client must discard the access token.',
  })
  @ApiStandardResponse(LogoutResponseDto, {
    description: 'Logged out successfully',
  })
  @ApiUnauthorized()
  logout(): LogoutResponseDto {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Current user',
    description: 'Returns the user for the current access token.',
  })
  @ApiStandardResponse(AuthUserDto, {
    description: 'Current user',
  })
  @ApiUnauthorized()
  me(@CurrentUser() user: AuthUser): Promise<AuthUserDto> {
    return this.authService.me(user);
  }
}
