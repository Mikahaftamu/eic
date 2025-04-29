import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  UsePipes, 
  ValidationPipe,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBody 
} from '@nestjs/swagger';
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
import { ProviderWithAdmin } from './entities/provider-with-admin.entity';

@ApiTags('providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard, AdminTypesGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @UsePipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  @ApiOperation({ 
    summary: 'Create a new provider',
    description: 'Creates a new provider with all required information including admin credentials'
  })
  @ApiBody({ type: CreateProviderDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Provider successfully created',
    type: Provider
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  async create(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<ProviderWithAdmin> {
    // Log the incoming payload for debugging
    console.log('Creating provider with data:', JSON.stringify(createProviderDto, null, 2));
    
    // Ensure proper number conversion for location coordinates
    if (createProviderDto.location) {
      createProviderDto.location.latitude = Number(createProviderDto.location.latitude);
      createProviderDto.location.longitude = Number(createProviderDto.location.longitude);
    }

    return this.providersService.create(insuranceCompanyId, createProviderDto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get all providers', 
    description: 'Returns all providers belonging to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return all providers',
    type: [Provider]
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  findAll(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string
  ): Promise<Provider[]> {
    return this.providersService.findByInsuranceCompany(insuranceCompanyId);
  }

  @Get('admins')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get all provider admins for the insurance company',
    description: 'Returns all provider admins belonging to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns list of all provider admins for the insurance company',
    type: [Provider]
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  async getProviderAdmins(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string
  ): Promise<Provider[]> {
    return this.providersService.findProviderAdmins(insuranceCompanyId);
  }

  @Get('admins/:providerId')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get a provider admin by ID',
    description: 'Returns provider admin details if it belongs to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the provider admin details',
    type: Provider
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Provider not found or does not belong to your insurance company' 
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  async getProviderAdminById(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('providerId') providerId: string
  ): Promise<Provider> {
    return this.providersService.findProviderAdminById(insuranceCompanyId, providerId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get a provider by id',
    description: 'Returns provider details if it belongs to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return the provider',
    type: Provider
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  findOne(
    @Param('id') id: string
  ): Promise<Provider> {
    // UUID validation
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
      throw new BadRequestException('Invalid provider ID format');
    }
    return this.providersService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Delete a provider',
    description: 'Soft deletes a provider if it belongs to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Provider successfully deleted',
    type: Provider
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  remove(
    @Param('id') id: string
  ): Promise<void> {
    return this.providersService.remove(id);
  }

  @Post('reset-password')
  @Roles(UserType.ADMIN)
  @AdminTypes(AdminType.INSURANCE_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ 
    summary: 'Reset password for a provider',
    description: 'Resets password for a provider belonging to the insurance company of the current admin'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password successfully reset' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Provider not found or does not belong to your insurance company' 
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized'
  })
  async resetPassword(
    @CurrentUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() resetPasswordDto: ResetProviderPasswordDto
  ): Promise<{ message: string }> {
    await this.providersService.resetPassword(insuranceCompanyId, resetPasswordDto);
    return { message: 'Password successfully reset' };
  }
}