import { Controller, Post, Body, UseGuards, Get, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { InsuranceCompanyGuard } from './guards/insurance-company.guard';
import { Roles } from './decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { StaffRole } from '../staff/entities/staff.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register/member')
  @ApiOperation({ summary: 'Register a new member' })
  @ApiResponse({ status: 201, description: 'Member registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async registerMember(@Body() registerMemberDto: RegisterMemberDto) {
    return this.authService.registerMember(registerMemberDto);
  }

  @Post('register/provider')
  @UseGuards(JwtAuthGuard, RolesGuard, InsuranceCompanyGuard)
  @Roles(UserType.STAFF)
  @ApiOperation({ summary: 'Register a new healthcare provider (Staff only)' })
  @ApiResponse({ status: 201, description: 'Provider registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Staff with provider management permission only' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async registerProvider(@Body() registerProviderDto: RegisterProviderDto, @Request() req) {
    // Check if the staff member has provider management permission
    const staff = req.user;
    if (!staff.roles.includes(StaffRole.PROVIDER_MANAGEMENT)) {
      throw new ForbiddenException('Staff member does not have provider management permission');
    }
    return this.authService.registerProvider(registerProviderDto);
  }

  @Post('register/staff')
  @UseGuards(JwtAuthGuard, RolesGuard, InsuranceCompanyGuard)
  @Roles(UserType.STAFF)
  @ApiOperation({ summary: 'Register a new staff member (Staff only)' })
  @ApiResponse({ status: 201, description: 'Staff registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Staff with staff management permission only' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async registerStaff(@Body() registerStaffDto: RegisterStaffDto, @Request() req) {
    // Check if the staff member has staff management permission
    const staff = req.user;
    if (!staff.roles.includes(StaffRole.STAFF_MANAGEMENT)) {
      throw new ForbiddenException('Staff member does not have staff management permission');
    }
    return this.authService.registerStaff(registerStaffDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }
}
