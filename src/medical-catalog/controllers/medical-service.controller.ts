import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicalCatalogService } from '../services/medical-catalog.service';
import { CreateMedicalServiceDto } from '../dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from '../dto/update-medical-service.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { ServiceType } from '../entities/medical-service.entity';

@ApiTags('Medical Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-catalog/services')
export class MedicalServiceController {
  constructor(private readonly medicalCatalogService: MedicalCatalogService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Create a new medical service' })
  @ApiResponse({ status: 201, description: 'The medical service has been successfully created.' })
  create(@Body() createMedicalServiceDto: CreateMedicalServiceDto) {
    return this.medicalCatalogService.createMedicalService(createMedicalServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical services' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ServiceType })
  @ApiQuery({ name: 'requiresPriorAuth', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns a list of medical services.' })
  findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: ServiceType,
    @Query('requiresPriorAuth') requiresPriorAuth?: string,
  ) {
    const priorAuthValue = requiresPriorAuth === 'true' 
      ? true 
      : requiresPriorAuth === 'false' 
        ? false 
        : undefined;
        
    return this.medicalCatalogService.findAllMedicalServices(
      insuranceCompanyId,
      page ? +page : 1,
      limit ? +limit : 10,
      search,
      categoryId,
      type,
      priorAuthValue,
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a medical service by code' })
  @ApiResponse({ status: 200, description: 'Returns the medical service.' })
  @ApiResponse({ status: 404, description: 'Medical service not found.' })
  findByCode(@Param('code') code: string) {
    return this.medicalCatalogService.findMedicalServiceByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical service by ID' })
  @ApiResponse({ status: 200, description: 'Returns the medical service.' })
  @ApiResponse({ status: 404, description: 'Medical service not found.' })
  findOne(@Param('id') id: string) {
    return this.medicalCatalogService.findMedicalServiceById(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Update a medical service' })
  @ApiResponse({ status: 200, description: 'The medical service has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Medical service not found.' })
  update(
    @Param('id') id: string,
    @Body() updateMedicalServiceDto: UpdateMedicalServiceDto,
  ) {
    return this.medicalCatalogService.updateMedicalService(id, updateMedicalServiceDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Delete a medical service' })
  @ApiResponse({ status: 200, description: 'The medical service has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Medical service not found.' })
  remove(@Param('id') id: string) {
    return this.medicalCatalogService.removeMedicalService(id);
  }
}
