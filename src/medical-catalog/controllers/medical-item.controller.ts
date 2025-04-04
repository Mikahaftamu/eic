import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicalCatalogService } from '../services/medical-catalog.service';
import { CreateMedicalItemDto } from '../dto/create-medical-item.dto';
import { UpdateMedicalItemDto } from '../dto/update-medical-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { MedicalItemType } from '../entities/medical-item.entity';

@ApiTags('Medical Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-catalog/items')
export class MedicalItemController {
  constructor(private readonly medicalCatalogService: MedicalCatalogService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Create a new medical item' })
  @ApiResponse({ status: 201, description: 'The medical item has been successfully created.' })
  create(@Body() createMedicalItemDto: CreateMedicalItemDto) {
    return this.medicalCatalogService.createMedicalItem(createMedicalItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: MedicalItemType })
  @ApiQuery({ name: 'requiresPriorAuth', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns a list of medical items.' })
  findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: MedicalItemType,
    @Query('requiresPriorAuth') requiresPriorAuth?: string,
  ) {
    const priorAuthValue = requiresPriorAuth === 'true' 
      ? true 
      : requiresPriorAuth === 'false' 
        ? false 
        : undefined;
        
    return this.medicalCatalogService.findAllMedicalItems(
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
  @ApiOperation({ summary: 'Get a medical item by code' })
  @ApiResponse({ status: 200, description: 'Returns the medical item.' })
  @ApiResponse({ status: 404, description: 'Medical item not found.' })
  findByCode(@Param('code') code: string) {
    return this.medicalCatalogService.findMedicalItemByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical item by ID' })
  @ApiResponse({ status: 200, description: 'Returns the medical item.' })
  @ApiResponse({ status: 404, description: 'Medical item not found.' })
  findOne(@Param('id') id: string) {
    return this.medicalCatalogService.findMedicalItemById(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Update a medical item' })
  @ApiResponse({ status: 200, description: 'The medical item has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Medical item not found.' })
  update(
    @Param('id') id: string,
    @Body() updateMedicalItemDto: UpdateMedicalItemDto,
  ) {
    return this.medicalCatalogService.updateMedicalItem(id, updateMedicalItemDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Delete a medical item' })
  @ApiResponse({ status: 200, description: 'The medical item has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Medical item not found.' })
  remove(@Param('id') id: string) {
    return this.medicalCatalogService.removeMedicalItem(id);
  }
}
