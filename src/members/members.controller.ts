import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { plainToClass } from 'class-transformer';
import { DependentDto } from './dto/dependent.dto';
import { MedicalHistoryDto } from './dto/medical-history.dto';

@ApiTags('members')
@Controller('members')
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ 
    status: 201, 
    description: 'The member has been successfully created.',
    type: MemberResponseDto
  })
  async create(@Body() createMemberDto: CreateMemberDto, @Request() req): Promise<MemberResponseDto> {
    // If insurance company ID is not provided, use the one from the authenticated user
    if (!createMemberDto.insuranceCompanyId && req.user.insuranceCompanyId) {
      createMemberDto.insuranceCompanyId = req.user.insuranceCompanyId;
    }

    // Only admins can create members for different insurance companies
    if (req.user.userType !== UserType.ADMIN && 
        createMemberDto.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only create members for your insurance company');
    }

    const member = await this.membersService.create(createMemberDto);
    return plainToClass(MemberResponseDto, member, { excludeExtraneousValues: false });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Get all members' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Return all members',
    type: [MemberResponseDto]
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Request() req?,
  ): Promise<{ data: MemberResponseDto[]; total: number; page: number; limit: number }> {
    let insuranceCompanyId = req.user.insuranceCompanyId;

    // If the user is an admin, they can see members from all insurance companies
    if (req.user.userType === UserType.ADMIN) {
      insuranceCompanyId = undefined;
    }

    const { data, total } = await this.membersService.findAll({
      page,
      limit,
      search,
      insuranceCompanyId,
      isActive: isActive === undefined ? undefined : isActive === true,
    });

    return {
      data: data.map(member => plainToClass(MemberResponseDto, member, { excludeExtraneousValues: false })),
      total,
      page: page || 1,
      limit: limit || 10,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a member by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the member',
    type: MemberResponseDto
  })
  async findOne(@Param('id') id: string, @Request() req): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Members can only view their own data
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only view your own data');
    }

    // Staff can only view members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only view members from your insurance company');
    }

    return plainToClass(MemberResponseDto, member, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Update a member' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully updated.',
    type: MemberResponseDto
  })
  async update(
    @Param('id') id: string, 
    @Body() updateMemberDto: UpdateMemberDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Members can only update their own data
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own data');
    }

    // Staff can only update members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only update members from your insurance company');
    }

    // Members cannot update certain fields
    if (req.user.userType === UserType.MEMBER) {
      const restrictedFields = [
        'userType', 'isActive', 'insuranceCompanyId', 'policyContractId',
        'policyNumber', 'benefits', 'coverageStartDate', 'coverageEndDate'
      ];

      for (const field of restrictedFields) {
        if (updateMemberDto[field] !== undefined) {
          throw new ForbiddenException(`You cannot update the ${field} field`);
        }
      }
    }

    const updatedMember = await this.membersService.update(id, updateMemberDto);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully deleted.'
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.membersService.remove(id);
    return { message: 'Member successfully deleted' };
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Deactivate a member' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully deactivated.',
    type: MemberResponseDto
  })
  async deactivate(@Param('id') id: string, @Request() req): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Staff can only deactivate members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only deactivate members from your insurance company');
    }

    const updatedMember = await this.membersService.deactivate(id);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Activate a member' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully activated.',
    type: MemberResponseDto
  })
  async activate(@Param('id') id: string, @Request() req): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Staff can only activate members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only activate members from your insurance company');
    }

    const updatedMember = await this.membersService.activate(id);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Post(':id/dependents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Add a dependent to a member' })
  @ApiBody({
    type: DependentDto,
    description: 'Dependent information',
    examples: {
      example1: {
        value: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
          relationship: "SPOUSE",
          gender: "Female",
          nationalId: "123-45-6789"
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The dependent has been successfully added.',
    type: MemberResponseDto
  })
  async addDependent(
    @Param('id') id: string, 
    @Body() dependentData: DependentDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Members can only add dependents to their own account
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only add dependents to your own account');
    }

    // Staff can only add dependents to members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only add dependents to members from your insurance company');
    }

    const updatedMember = await this.membersService.addDependent(id, dependentData);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Delete(':id/dependents/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Remove a dependent from a member' })
  @ApiResponse({
    status: 200,
    description: 'The dependent has been successfully removed.',
    type: MemberResponseDto
  })
  async removeDependent(
    @Param('id') id: string, 
    @Param('index') index: string,
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Members can only remove dependents from their own account
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only remove dependents from your own account');
    }

    // Staff can only remove dependents from members of their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only remove dependents from members of your insurance company');
    }

    const dependentIndex = parseInt(index, 10);
    if (isNaN(dependentIndex)) {
      throw new BadRequestException('Invalid dependent index');
    }

    const updatedMember = await this.membersService.removeDependent(id, dependentIndex);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Patch(':id/dependents/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Update a dependent of a member' })
  @ApiBody({
    type: DependentDto,
    description: 'Updated dependent information',
    examples: {
      example1: {
        value: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
          relationship: "SPOUSE",
          gender: "Female",
          nationalId: "123-45-6789"
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The dependent has been successfully updated.',
    type: MemberResponseDto
  })
  async updateDependent(
    @Param('id') id: string, 
    @Param('index') index: string,
    @Body() dependentData: DependentDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Members can only update dependents from their own account
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only update dependents from your own account');
    }

    // Staff can only update dependents from members of their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only update dependents from members of your insurance company');
    }

    const dependentIndex = parseInt(index, 10);
    if (isNaN(dependentIndex)) {
      throw new BadRequestException('Invalid dependent index');
    }

    const updatedMember = await this.membersService.updateDependent(id, dependentIndex, dependentData);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Post(':id/medical-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Add medical history to a member' })
  @ApiBody({
    type: MedicalHistoryDto,
    description: 'Medical history information',
    examples: {
      example1: {
        value: {
          conditionType: "CHRONIC",
          conditionName: "Hypertension",
          diagnosisDate: "2020-01-15",
          isActive: true,
          treatingPhysician: "Dr. Jane Smith",
          treatmentFacility: "City General Hospital",
          medications: "Lisinopril 10mg daily",
          notes: "Regular checkups every 3 months"
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The medical history has been successfully added.',
    type: MemberResponseDto
  })
  async addMedicalHistory(
    @Param('id') id: string, 
    @Body() medicalHistoryData: MedicalHistoryDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Staff can only add medical history to members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only add medical history to members from your insurance company');
    }

    const updatedMember = await this.membersService.addMedicalHistory(id, medicalHistoryData);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Patch(':id/benefits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update benefits for a member' })
  @ApiResponse({
    status: 200,
    description: 'The benefits have been successfully updated.',
    type: MemberResponseDto
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        benefits: {
          type: 'object',
          properties: {
            planType: { type: 'string', example: 'Comprehensive' },
            coverageLevel: { type: 'string', example: 'Premium' },
            deductible: { type: 'number', example: 1000 },
            copay: { type: 'number', example: 20 },
            outOfPocketMax: { type: 'number', example: 5000 },
            prescriptionCoverage: { type: 'boolean', example: true },
            dentalCoverage: { type: 'boolean', example: true },
            visionCoverage: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  async updateBenefits(
    @Param('id') id: string, 
    @Body() benefitsData: { benefits: {
      planType: string;
      coverageLevel: string;
      deductible: number;
      copay: number;
      outOfPocketMax: number;
      prescriptionCoverage?: boolean;
      dentalCoverage?: boolean;
      visionCoverage?: boolean;
    }},
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Staff can only update benefits for members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only update benefits for members from your insurance company');
    }

    const updatedMember = await this.membersService.updateBenefits(id, benefitsData);
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Patch(':id/coverage-dates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update coverage dates for a member' })
  @ApiResponse({
    status: 200,
    description: 'The coverage dates have been successfully updated.',
    type: MemberResponseDto
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        startDate: { 
          type: 'string', 
          format: 'date',
          example: '2024-01-01',
          description: 'Coverage start date'
        },
        endDate: { 
          type: 'string', 
          format: 'date',
          example: '2024-12-31',
          description: 'Coverage end date'
        }
      },
      required: ['startDate', 'endDate']
    }
  })
  async updateCoverageDates(
    @Param('id') id: string, 
    @Body() datesData: { startDate: string; endDate: string },
    @Request() req,
  ): Promise<MemberResponseDto> {
    const member = await this.membersService.findOne(id);

    // Staff can only update coverage dates for members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only update coverage dates for members from your insurance company');
    }

    const updatedMember = await this.membersService.updateCoverageDates(
      id, 
      new Date(datesData.startDate), 
      new Date(datesData.endDate)
    );
    
    return plainToClass(MemberResponseDto, updatedMember, { excludeExtraneousValues: false });
  }

  @Get(':id/eligibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER, UserType.PROVIDER)
  @ApiOperation({ summary: 'Check eligibility for a member' })
  @ApiResponse({
    status: 200,
    description: 'Return eligibility status',
    schema: {
      type: 'object',
      properties: {
        eligible: { type: 'boolean' },
        reason: { type: 'string', nullable: true },
      },
    },
  })
  async checkEligibility(@Param('id') id: string, @Request() req): Promise<{ eligible: boolean; reason?: string }> {
    const member = await this.membersService.findOne(id);

    // Members can only check their own eligibility
    if (req.user.userType === UserType.MEMBER && req.user.id !== id) {
      throw new ForbiddenException('You can only check your own eligibility');
    }

    // Staff and providers can only check eligibility for members from their insurance company
    if ((req.user.userType === UserType.STAFF || req.user.userType === UserType.PROVIDER) && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only check eligibility for members from your insurance company');
    }

    return this.membersService.isEligible(id);
  }
}
