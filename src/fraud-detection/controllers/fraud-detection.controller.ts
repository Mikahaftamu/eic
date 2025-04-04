import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { CreateFraudRuleDto } from '../dto/create-fraud-rule.dto';
import { UpdateFraudRuleDto } from '../dto/update-fraud-rule.dto';
import { UpdateAlertStatusDto } from '../dto/update-alert-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { AlertStatus, AlertResolution } from '../entities/claim-fraud-alert.entity';
import { RuleSeverity } from '../entities/fraud-rule.entity';

@ApiTags('Fraud Detection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fraud-detection')
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  // Rule management endpoints
  @Post('rules')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Create a new fraud detection rule' })
  @ApiResponse({ status: 201, description: 'The fraud rule has been successfully created.' })
  createRule(@Body() createFraudRuleDto: CreateFraudRuleDto) {
    return this.fraudDetectionService.createRule(createFraudRuleDto);
  }

  @Get('rules')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Get all fraud detection rules' })
  @ApiResponse({ status: 200, description: 'Returns a list of fraud detection rules.' })
  findAllRules(@Query('insuranceCompanyId') insuranceCompanyId?: string) {
    return this.fraudDetectionService.findAllRules(insuranceCompanyId);
  }

  @Get('rules/:id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Get a fraud rule by ID' })
  @ApiResponse({ status: 200, description: 'Returns the fraud rule.' })
  @ApiResponse({ status: 404, description: 'Fraud rule not found.' })
  findRuleById(@Param('id') id: string) {
    return this.fraudDetectionService.findRuleById(id);
  }

  @Patch('rules/:id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Update a fraud rule' })
  @ApiResponse({ status: 200, description: 'The fraud rule has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Fraud rule not found.' })
  updateRule(
    @Param('id') id: string,
    @Body() updateFraudRuleDto: UpdateFraudRuleDto,
  ) {
    return this.fraudDetectionService.updateRule(id, updateFraudRuleDto);
  }

  @Patch('rules/:id/activate')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Activate a fraud rule' })
  @ApiResponse({ status: 200, description: 'The fraud rule has been successfully activated.' })
  @ApiResponse({ status: 404, description: 'Fraud rule not found.' })
  activateRule(@Param('id') id: string) {
    return this.fraudDetectionService.activateRule(id);
  }

  @Patch('rules/:id/deactivate')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Deactivate a fraud rule' })
  @ApiResponse({ status: 200, description: 'The fraud rule has been successfully deactivated.' })
  @ApiResponse({ status: 404, description: 'Fraud rule not found.' })
  deactivateRule(@Param('id') id: string) {
    return this.fraudDetectionService.deactivateRule(id);
  }

  @Delete('rules/:id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Delete a fraud rule' })
  @ApiResponse({ status: 200, description: 'The fraud rule has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Fraud rule not found.' })
  removeRule(@Param('id') id: string) {
    return this.fraudDetectionService.removeRule(id);
  }

  // Alert management endpoints
  @Get('alerts')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Get all fraud alerts' })
  @ApiQuery({ name: 'insuranceCompanyId', required: true, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  @ApiQuery({ name: 'severity', required: false, enum: RuleSeverity })
  @ApiQuery({ name: 'fromDate', required: false, type: Date })
  @ApiQuery({ name: 'toDate', required: false, type: Date })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns a list of fraud alerts.' })
  findAllAlerts(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('status') status?: AlertStatus,
    @Query('severity') severity?: RuleSeverity,
    @Query('fromDate') fromDate?: Date,
    @Query('toDate') toDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.fraudDetectionService.findAllAlerts(
      insuranceCompanyId,
      status,
      severity,
      fromDate,
      toDate,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('alerts/:id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Get a fraud alert by ID' })
  @ApiResponse({ status: 200, description: 'Returns the fraud alert.' })
  @ApiResponse({ status: 404, description: 'Fraud alert not found.' })
  findAlertById(@Param('id') id: string) {
    return this.fraudDetectionService.findAlertById(id);
  }

  @Patch('alerts/:id/status')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Update a fraud alert status' })
  @ApiResponse({ status: 200, description: 'The fraud alert status has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Fraud alert not found.' })
  updateAlertStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAlertStatusDto,
  ) {
    return this.fraudDetectionService.updateAlertStatus(id, updateStatusDto);
  }

  // Fraud detection endpoints
  @Post('analyze/claim/:claimId')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Analyze a claim for potential fraud' })
  @ApiResponse({ status: 200, description: 'Returns fraud detection results.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  detectFraudForClaim(
    @Param('claimId') claimId: string,
    @Query('insuranceCompanyId') insuranceCompanyId: string,
  ) {
    return this.fraudDetectionService.detectFraudForClaim(claimId, insuranceCompanyId);
  }

  @Get('statistics')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.INSURANCE_STAFF)
  @ApiOperation({ summary: 'Get fraud detection statistics' })
  @ApiQuery({ name: 'insuranceCompanyId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns fraud detection statistics.' })
  getAlertStatistics(@Query('insuranceCompanyId') insuranceCompanyId: string) {
    return this.fraudDetectionService.getAlertStatistics(insuranceCompanyId);
  }
}
