import { Controller, Get, Post, Body, Patch, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyProductDto } from './dto/create-policy-product.dto';
import { UpdatePolicyProductDto } from './dto/update-policy-product.dto';
import { PolicyProduct } from './entities/policy-product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ProductStatus } from './enums/product-status.enum';
import { PolicyProductResponse } from './dto/policy-product-response.dto';

@ApiTags('Policy Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('policy-products')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @UsePipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  @ApiOperation({ 
    summary: 'Create a new policy product',
    description: 'Creates a new insurance policy product with specified coverage, benefits, and eligibility rules.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Policy product created successfully',
    type: PolicyProductResponse 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - user not logged in' })
  @ApiForbiddenResponse({ description: 'Forbidden - user not authorized' })
  @ApiConflictResponse({ description: 'Policy product with this code already exists' })
  create(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() createDto: CreatePolicyProductDto,
  ): Promise<PolicyProduct> {
    return this.policyService.create(insuranceCompanyId, createDto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get all policy products',
    description: 'Retrieves all policy products for the current insurance company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of policy products',
    type: [PolicyProductResponse] 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - user not logged in' })
  @ApiForbiddenResponse({ description: 'Forbidden - user not authorized' })
  findAll(@GetUser('insuranceCompanyId') insuranceCompanyId: string): Promise<PolicyProduct[]> {
    return this.policyService.findAll(insuranceCompanyId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Get a policy product by ID',
    description: 'Retrieves a specific policy product by its ID.'
  })
  @ApiParam({ name: 'id', description: 'Policy product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Policy product found',
    type: PolicyProductResponse 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - user not logged in' })
  @ApiForbiddenResponse({ description: 'Forbidden - user not authorized' })
  @ApiNotFoundResponse({ description: 'Policy product not found' })
  findOne(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id') id: string,
  ): Promise<PolicyProduct> {
    return this.policyService.findOne(id, insuranceCompanyId);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Update a policy product',
    description: 'Updates an existing policy product. Only allowed for products in DRAFT status.'
  })
  @ApiParam({ name: 'id', description: 'Policy product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Policy product updated successfully',
    type: PolicyProductResponse 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - user not logged in' })
  @ApiForbiddenResponse({ description: 'Forbidden - user not authorized' })
  @ApiNotFoundResponse({ description: 'Policy product not found' })
  @ApiConflictResponse({ description: 'Cannot update an active or inactive policy product' })
  update(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePolicyProductDto,
  ): Promise<PolicyProduct> {
    return this.policyService.update(id, insuranceCompanyId, updateDto);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ 
    summary: 'Update policy product status',
    description: 'Updates the status of a policy product (DRAFT, ACTIVE, INACTIVE).'
  })
  @ApiParam({ name: 'id', description: 'Policy product ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ProductStatus),
          description: 'New status for the policy product'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Policy product status updated successfully',
    type: PolicyProductResponse 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - user not logged in' })
  @ApiForbiddenResponse({ description: 'Forbidden - user not authorized' })
  @ApiNotFoundResponse({ description: 'Policy product not found' })
  @ApiConflictResponse({ description: 'Invalid status transition or product validation failed' })
  updateStatus(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id') id: string,
    @Body('status') status: ProductStatus,
  ): Promise<PolicyProduct> {
    return this.policyService.updateStatus(id, insuranceCompanyId, status);
  }
}
