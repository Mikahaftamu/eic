import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyProduct } from './entities/policy-product.entity';
import { CreatePolicyProductDto } from './dto/create-policy-product.dto';
import { UpdatePolicyProductDto } from './dto/update-policy-product.dto';
import { ProductStatus } from './enums/product-status.enum';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(PolicyProduct)
    private readonly policyProductRepository: Repository<PolicyProduct>,
  ) {}

  async create(insuranceCompanyId: string, createDto: CreatePolicyProductDto): Promise<PolicyProduct> {
    // Check if product code already exists
    const existingProduct = await this.policyProductRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingProduct) {
      throw new ConflictException('Policy product with this code already exists');
    }

    // Create a new policy product instance
    const product = new PolicyProduct();
    
    // Map DTO properties to entity
    Object.assign(product, {
      ...createDto,
      insuranceCompanyId,
      status: ProductStatus.DRAFT,
    });

    // Save and return the new product
    return this.policyProductRepository.save(product);
  }

  async findAll(insuranceCompanyId: string): Promise<PolicyProduct[]> {
    return this.policyProductRepository.find({
      where: { insuranceCompanyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, insuranceCompanyId: string): Promise<PolicyProduct> {
    const product = await this.policyProductRepository.findOne({
      where: { id, insuranceCompanyId },
    });

    if (!product) {
      throw new NotFoundException('Policy product not found');
    }

    return product;
  }

  async update(
    id: string,
    insuranceCompanyId: string,
    updateDto: UpdatePolicyProductDto,
  ): Promise<PolicyProduct> {
    const product = await this.findOne(id, insuranceCompanyId);

    // Only allow updates if product is in DRAFT status
    if (product.status !== ProductStatus.DRAFT) {
      throw new ConflictException('Cannot update an active or inactive policy product');
    }

    // If code is being updated, check for uniqueness
    if (updateDto.code && updateDto.code !== product.code) {
      const existingProduct = await this.policyProductRepository.findOne({
        where: { code: updateDto.code },
      });

      if (existingProduct) {
        throw new ConflictException('Policy product with this code already exists');
      }
    }

    // Update product properties
    Object.assign(product, updateDto);

    // Save and return the updated product
    return this.policyProductRepository.save(product);
  }

  async updateStatus(
    id: string,
    insuranceCompanyId: string,
    status: ProductStatus,
  ): Promise<PolicyProduct> {
    const product = await this.findOne(id, insuranceCompanyId);

    // Validate status transition
    if (status === ProductStatus.ACTIVE && !this.validateProductForActivation(product)) {
      throw new ConflictException('Product cannot be activated. Please check all required fields.');
    }

    product.status = status;
    return this.policyProductRepository.save(product);
  }

  private validateProductForActivation(product: PolicyProduct): boolean {
    // Add validation logic here
    // Example: check if all required fields are set, benefits are properly configured, etc.
    return true;
  }
}
