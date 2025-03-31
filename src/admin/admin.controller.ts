import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminTypesGuard } from '../auth/guards/admin-types.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminTypes } from '../auth/decorators/admin-types.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { AdminType } from '../common/enums/admin-type.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Admin } from './entities/admin.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, AdminTypesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('reset-password')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Reset password for an insurance company admin' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password successfully reset' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Only system admins can reset passwords' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Insurance company admin not found' 
  })
  async resetPassword(
    @CurrentUser() currentAdmin: Admin,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    await this.adminService.resetInsuranceAdminPassword(currentAdmin, resetPasswordDto);
    return { message: 'Password successfully reset' };
  }

  @Get('insurance-admins')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all insurance company admins' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of all insurance company admins',
    type: [Admin]
  })
  async getInsuranceAdmins(): Promise<Admin[]> {
    return this.adminService.findInsuranceAdmins();
  }

  @Get('insurance-admins/:insuranceCompanyId')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get insurance company admins by company ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of insurance company admins for the specified company',
    type: [Admin]
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Insurance company not found' 
  })
  async getInsuranceAdminsByCompany(
    @Param('insuranceCompanyId') insuranceCompanyId: string
  ): Promise<Admin[]> {
    return this.adminService.findInsuranceAdminsByCompany(insuranceCompanyId);
  }
}
