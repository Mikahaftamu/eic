import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ResetProviderPasswordDto } from './dto/reset-provider-password.dto';
import { Provider } from './entities/provider.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminTypesGuard } from '../auth/guards/admin-types.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminTypes } from '../auth/decorators/admin-types.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { AdminType } from '../common/enums/admin-type.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard, AdminTypesGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider successfully created' })
  create(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() createProviderDto: CreateProviderDto,
  ) {
    return this.providersService.create(insuranceCompanyId, createProviderDto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({ status: 200, description: 'Return all providers' })
  findAll(@CurrentUser('insuranceCompanyId') insuranceCompanyId: string) {
    return this.providersService.findByInsuranceCompany(insuranceCompanyId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get a provider by id' })
  @ApiResponse({ status: 200, description: 'Return the provider' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Delete a provider' })
  @ApiResponse({ status: 200, description: 'Provider successfully deleted' })
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }

  @Post('reset-password')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Reset password for a provider' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password successfully reset' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Provider not found or does not belong to your insurance company' 
  })
  async resetPassword(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() resetPasswordDto: ResetProviderPasswordDto
  ): Promise<{ message: string }> {
    await this.providersService.resetPassword(insuranceCompanyId, resetPasswordDto);
    return { message: 'Password successfully reset' };
  }

  @Get('admins')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get all provider admins for the insurance company' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of all provider admins for the insurance company',
    type: [Provider]
  })
  async getProviderAdmins(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string
  ): Promise<Provider[]> {
    return this.providersService.findProviderAdmins(insuranceCompanyId);
  }

  @Get('admins/:providerId')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get a provider admin by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the provider admin details',
    type: Provider
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Provider not found or does not belong to your insurance company' 
  })
  async getProviderAdminById(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('providerId') providerId: string
  ): Promise<Provider> {
    return this.providersService.findProviderAdminById(insuranceCompanyId, providerId);
  }
}
