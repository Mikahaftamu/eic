import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicalCatalogService } from '../services/medical-catalog.service';
import { CreateMedicalCategoryDto } from '../dto/create-medical-category.dto';
import { UpdateMedicalCategoryDto } from '../dto/update-medical-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';

@ApiTags('Medical Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-catalog/categories')
export class MedicalCategoryController {
  constructor(private readonly medicalCatalogService: MedicalCatalogService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Create a new medical category' })
  @ApiResponse({ status: 201, description: 'The medical category has been successfully created.' })
  create(@Body() createMedicalCategoryDto: CreateMedicalCategoryDto) {
    return this.medicalCatalogService.createCategory(createMedicalCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'parentCategoryId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns a list of medical categories.' })
  findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('parentCategoryId') parentCategoryId?: string,
  ) {
    return this.medicalCatalogService.findAllCategories(
      insuranceCompanyId,
      page ? +page : 1,
      limit ? +limit : 10,
      search,
      parentCategoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical category by ID' })
  @ApiResponse({ status: 200, description: 'Returns the medical category.' })
  @ApiResponse({ status: 404, description: 'Medical category not found.' })
  findOne(@Param('id') id: string) {
    return this.medicalCatalogService.findCategoryById(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Update a medical category' })
  @ApiResponse({ status: 200, description: 'The medical category has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Medical category not found.' })
  update(
    @Param('id') id: string,
    @Body() updateMedicalCategoryDto: UpdateMedicalCategoryDto,
  ) {
    return this.medicalCatalogService.updateCategory(id, updateMedicalCategoryDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Delete a medical category' })
  @ApiResponse({ status: 200, description: 'The medical category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Medical category not found.' })
  remove(@Param('id') id: string) {
    return this.medicalCatalogService.removeCategory(id);
  }
}
