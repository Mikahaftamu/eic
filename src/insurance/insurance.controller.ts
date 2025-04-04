import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceCompanyDto } from './dto/create-insurance-company.dto';
import { UpdateInsuranceCompanyDto } from './dto/update-insurance-company.dto';
import { InsuranceCompany } from './entities/insurance-company.entity';

@ApiTags('insurance-companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insurance-companies')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new insurance company (Admin only)' })
  @ApiResponse({ status: 201, description: 'Insurance company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createDto: CreateInsuranceCompanyDto): Promise<InsuranceCompany> {
    return this.insuranceService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance companies' })
  @ApiResponse({ status: 200, description: 'Returns all insurance companies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<InsuranceCompany[]> {
    return this.insuranceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an insurance company by ID' })
  @ApiResponse({ status: 200, description: 'Returns the insurance company' })
  @ApiResponse({ status: 404, description: 'Insurance company not found' })
  async findOne(@Param('id') id: string): Promise<InsuranceCompany> {
    return this.insuranceService.findOne(id);
  }

  @Put(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update an insurance company (Admin only)' })
  @ApiResponse({ status: 200, description: 'Insurance company updated successfully' })
  @ApiResponse({ status: 404, description: 'Insurance company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInsuranceCompanyDto,
  ): Promise<InsuranceCompany> {
    return this.insuranceService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete an insurance company (Admin only)' })
  @ApiResponse({ status: 200, description: 'Insurance company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Insurance company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.insuranceService.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Toggle insurance company active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Insurance company status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Insurance company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async toggleActive(@Param('id') id: string): Promise<InsuranceCompany> {
    return this.insuranceService.toggleActive(id);
  }
}
