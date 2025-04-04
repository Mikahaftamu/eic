import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ClaimResponseDto } from './dto/claim-response.dto';
import { ClaimAppealResponseDto } from './dto/claim-appeal-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { ClaimStatus, ClaimType } from './entities/claim.entity';
import { plainToClass } from 'class-transformer';

@ApiTags('claims')
@Controller('claims')
@ApiBearerAuth()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER)
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiResponse({
    status: 201,
    description: 'The claim has been successfully created.',
    type: ClaimResponseDto,
  })
  async create(@Body() createClaimDto: CreateClaimDto, @Request() req): Promise<ClaimResponseDto> {
    // If insurance company ID is not provided, use the one from the authenticated user
    if (!createClaimDto.insuranceCompanyId && req.user.insuranceCompanyId) {
      createClaimDto.insuranceCompanyId = req.user.insuranceCompanyId;
    }

    // Only admins can create claims for different insurance companies
    if (
      req.user.userType !== UserType.ADMIN &&
      createClaimDto.insuranceCompanyId !== req.user.insuranceCompanyId
    ) {
      throw new ForbiddenException('You can only create claims for your insurance company');
    }

    // If the user is a provider, set the providerId to the user's ID
    if (req.user.userType === UserType.PROVIDER && !createClaimDto.providerId) {
      createClaimDto.providerId = req.user.id;
    }

    const claim = await this.claimsService.create(createClaimDto);
    return plainToClass(ClaimResponseDto, claim, { excludeExtraneousValues: true });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER, UserType.MEMBER)
  @ApiOperation({ summary: 'Get all claims' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ClaimStatus })
  @ApiQuery({ name: 'claimType', required: false, enum: ClaimType })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({
    status: 200,
    description: 'Return all claims',
    type: [ClaimResponseDto],
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: ClaimStatus,
    @Query('claimType') claimType?: ClaimType,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Request() req?,
  ): Promise<{ data: ClaimResponseDto[]; total: number; page: number; limit: number }> {
    // Build query options based on user type
    const options: any = {
      page,
      limit,
      search,
      status,
      claimType,
      startDate,
      endDate,
    };

    // Apply user-specific filters
    if (req.user.userType === UserType.ADMIN) {
      // Admins can see all claims, no additional filters needed
    } else if (req.user.userType === UserType.STAFF) {
      // Staff can only see claims from their insurance company
      options.insuranceCompanyId = req.user.insuranceCompanyId;
    } else if (req.user.userType === UserType.PROVIDER) {
      // Providers can only see claims they submitted
      options.providerId = req.user.id;
      options.insuranceCompanyId = req.user.insuranceCompanyId;
    } else if (req.user.userType === UserType.MEMBER) {
      // Members can only see their own claims
      options.memberId = req.user.id;
    }

    const { data, total } = await this.claimsService.findAll(options);

    return {
      data: data.map(claim => plainToClass(ClaimResponseDto, claim, { excludeExtraneousValues: true })),
      total,
      page: page || 1,
      limit: limit || 10,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a claim by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the claim',
    type: ClaimResponseDto,
  })
  async findOne(@Param('id') id: string, @Request() req): Promise<ClaimResponseDto> {
    const claim = await this.claimsService.findOne(id);

    // Check permissions based on user type
    if (req.user.userType === UserType.MEMBER && claim.memberId !== req.user.id) {
      throw new ForbiddenException('You can only view your own claims');
    }

    if (req.user.userType === UserType.PROVIDER && claim.providerId !== req.user.id) {
      throw new ForbiddenException('You can only view claims you submitted');
    }

    if (req.user.userType === UserType.STAFF && claim.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only view claims from your insurance company');
    }

    return plainToClass(ClaimResponseDto, claim, { excludeExtraneousValues: true });
  }

  @Get('number/:claimNumber')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a claim by claim number' })
  @ApiResponse({
    status: 200,
    description: 'Return the claim',
    type: ClaimResponseDto,
  })
  async findByClaimNumber(@Param('claimNumber') claimNumber: string, @Request() req): Promise<ClaimResponseDto> {
    const claim = await this.claimsService.findByClaimNumber(claimNumber);

    // Check permissions based on user type
    if (req.user.userType === UserType.MEMBER && claim.memberId !== req.user.id) {
      throw new ForbiddenException('You can only view your own claims');
    }

    if (req.user.userType === UserType.PROVIDER && claim.providerId !== req.user.id) {
      throw new ForbiddenException('You can only view claims you submitted');
    }

    if (req.user.userType === UserType.STAFF && claim.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only view claims from your insurance company');
    }

    return plainToClass(ClaimResponseDto, claim, { excludeExtraneousValues: true });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update claim status' })
  @ApiResponse({
    status: 200,
    description: 'The claim status has been successfully updated.',
    type: ClaimResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: ClaimStatus; notes?: string },
    @Request() req,
  ): Promise<ClaimResponseDto> {
    const claim = await this.claimsService.findOne(id);

    // Staff can only update claims from their insurance company
    if (req.user.userType === UserType.STAFF && claim.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only update claims from your insurance company');
    }

    const updatedClaim = await this.claimsService.updateStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.notes,
    );

    return plainToClass(ClaimResponseDto, updatedClaim, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Soft delete a claim' })
  @ApiResponse({
    status: 200,
    description: 'The claim has been successfully deleted.',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.claimsService.softDelete(id);
    return { message: 'Claim successfully deleted' };
  }

  @Post(':id/appeals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER, UserType.MEMBER)
  @ApiOperation({ summary: 'Create an appeal for a claim' })
  @ApiResponse({
    status: 201,
    description: 'The appeal has been successfully created.',
    type: ClaimAppealResponseDto,
  })
  async createAppeal(
    @Param('id') id: string,
    @Body() appealDto: {
      reason: string;
      appealedAmount: number;
      supportingInformation?: string;
      documentReferences?: string[];
    },
    @Request() req,
  ): Promise<ClaimAppealResponseDto> {
    const claim = await this.claimsService.findOne(id);

    // Check permissions based on user type
    if (req.user.userType === UserType.MEMBER && claim.memberId !== req.user.id) {
      throw new ForbiddenException('You can only appeal your own claims');
    }

    if (req.user.userType === UserType.PROVIDER && claim.providerId !== req.user.id) {
      throw new ForbiddenException('You can only appeal claims you submitted');
    }

    if (req.user.userType === UserType.STAFF && claim.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only appeal claims from your insurance company');
    }

    const appeal = await this.claimsService.createAppeal(
      id,
      req.user.id,
      appealDto.reason,
      appealDto.appealedAmount,
      appealDto.supportingInformation,
      appealDto.documentReferences,
    );

    return plainToClass(ClaimAppealResponseDto, appeal, { excludeExtraneousValues: true });
  }

  @Get(':id/appeals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.PROVIDER, UserType.MEMBER)
  @ApiOperation({ summary: 'Get all appeals for a claim' })
  @ApiResponse({
    status: 200,
    description: 'Return all appeals for the claim',
    type: [ClaimAppealResponseDto],
  })
  async getAppeals(@Param('id') id: string, @Request() req): Promise<ClaimAppealResponseDto[]> {
    const claim = await this.claimsService.findOne(id);

    // Check permissions based on user type
    if (req.user.userType === UserType.MEMBER && claim.memberId !== req.user.id) {
      throw new ForbiddenException('You can only view appeals for your own claims');
    }

    if (req.user.userType === UserType.PROVIDER && claim.providerId !== req.user.id) {
      throw new ForbiddenException('You can only view appeals for claims you submitted');
    }

    if (req.user.userType === UserType.STAFF && claim.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only view appeals for claims from your insurance company');
    }

    const appeals = await this.claimsService.getAppealsForClaim(id);
    return appeals.map(appeal => plainToClass(ClaimAppealResponseDto, appeal, { excludeExtraneousValues: true }));
  }
}
