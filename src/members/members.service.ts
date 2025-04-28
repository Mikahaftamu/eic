import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import * as bcrypt from 'bcrypt';
import { PolicyProduct } from '../policy/entities/policy-product.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PolicyProduct)
    private readonly policyProductRepository: Repository<PolicyProduct>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // Check if username or email already exists
    const existingMember = await this.memberRepository.findOne({
      where: [
        { username: createMemberDto.username },
        { email: createMemberDto.email },
      ],
    });

    if (existingMember) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);

    // Create new member
    const newMember = this.memberRepository.create({
      ...createMemberDto,
      password: hashedPassword,
    });

    if (createMemberDto.policyProductId) {
      const policyProduct = await this.policyProductRepository.findOne({
        where: { id: createMemberDto.policyProductId }
      });
      if (policyProduct) {
        newMember.policyProduct = policyProduct;
      }
    }

    return this.memberRepository.save(newMember);
  }

  async findAll(
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      insuranceCompanyId?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: Member[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Member> = {};

    if (options?.insuranceCompanyId) {
      whereConditions.insuranceCompanyId = options.insuranceCompanyId;
    }

    if (options?.isActive !== undefined) {
      whereConditions.isActive = options.isActive;
    }

    // Add search condition if provided
    if (options?.search) {
      return this.search(options.search, {
        page,
        limit,
        insuranceCompanyId: options.insuranceCompanyId,
        isActive: options.isActive,
      });
    }

    const [data, total] = await this.memberRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['policyProduct']
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async search(
    query: string,
    options?: {
      page?: number;
      limit?: number;
      insuranceCompanyId?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: Member[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions for search
    const whereConditions: any = [
      { firstName: ILike(`%${query}%`) },
      { lastName: ILike(`%${query}%`) },
      { email: ILike(`%${query}%`) },
      { username: ILike(`%${query}%`) },
      { policyNumber: ILike(`%${query}%`) },
      { nationalId: ILike(`%${query}%`) },
    ];

    // Add insurance company filter if provided
    if (options?.insuranceCompanyId) {
      whereConditions.forEach(condition => {
        condition.insuranceCompanyId = options.insuranceCompanyId;
      });
    }

    // Add active status filter if provided
    if (options?.isActive !== undefined) {
      whereConditions.forEach(condition => {
        condition.isActive = options.isActive;
      });
    }

    const [data, total] = await this.memberRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['policyProduct']
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['policyProduct']
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async findByUsername(username: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { username },
      relations: ['policyProduct']
    });

    if (!member) {
      throw new NotFoundException(`Member with username ${username} not found`);
    }

    return member;
  }

  async findByPolicyNumber(policyNumber: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { policyNumber },
      relations: ['policyProduct']
    });

    if (!member) {
      throw new NotFoundException(`Member with policy number ${policyNumber} not found`);
    }

    return member;
  }

  async findByPolicyProductId(policyProductId: string): Promise<Member[]> {
    return this.memberRepository.find({
      where: { policyProductId },
      relations: ['policyProduct']
    });
  }

  async update(id: string, updateMemberDto: Partial<CreateMemberDto>): Promise<Member> {
    const member = await this.findOne(id);
    
    if (updateMemberDto.policyProductId) {
      const policyProduct = await this.policyProductRepository.findOne({
        where: { id: updateMemberDto.policyProductId }
      });
      if (policyProduct) {
        member.policyProduct = policyProduct;
      }
    }
    
    // Check if username or email is being changed and if it already exists
    if (updateMemberDto.username && updateMemberDto.username !== member.username) {
      const existingMember = await this.memberRepository.findOne({
        where: { username: updateMemberDto.username },
      });

      if (existingMember) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existingMember = await this.memberRepository.findOne({
        where: { email: updateMemberDto.email },
      });

      if (existingMember) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash the password if it's being updated
    if (updateMemberDto.password) {
      updateMemberDto.password = await bcrypt.hash(updateMemberDto.password, 10);
    }

    // Update the member
    Object.assign(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.memberRepository.delete(id);
  }

  async deactivate(id: string): Promise<Member> {
    const member = await this.findOne(id);
    member.isActive = false;
    return this.memberRepository.save(member);
  }

  async activate(id: string): Promise<Member> {
    const member = await this.findOne(id);
    member.isActive = true;
    return this.memberRepository.save(member);
  }

  async addDependent(id: string, dependentData: any): Promise<Member> {
    const member = await this.findOne(id);
    
    if (!member.dependents) {
      member.dependents = [];
    }
    
    member.dependents.push(dependentData);
    return this.memberRepository.save(member);
  }

  async removeDependent(id: string, dependentIndex: number): Promise<Member> {
    const member = await this.findOne(id);
    
    if (!member.dependents || member.dependents.length <= dependentIndex) {
      throw new BadRequestException(`Dependent at index ${dependentIndex} not found`);
    }
    
    member.dependents.splice(dependentIndex, 1);
    return this.memberRepository.save(member);
  }

  async updateDependent(id: string, dependentIndex: number, dependentData: any): Promise<Member> {
    const member = await this.findOne(id);
    
    if (!member.dependents || member.dependents.length <= dependentIndex) {
      throw new BadRequestException(`Dependent at index ${dependentIndex} not found`);
    }
    
    member.dependents[dependentIndex] = {
      ...member.dependents[dependentIndex],
      ...dependentData,
    };
    
    return this.memberRepository.save(member);
  }

  async addMedicalHistory(id: string, medicalHistoryData: any): Promise<Member> {
    const member = await this.findOne(id);
    
    if (!member.medicalHistory) {
      member.medicalHistory = [];
    }
    
    member.medicalHistory.push(medicalHistoryData);
    return this.memberRepository.save(member);
  }

  async updateBenefits(id: string, benefitsData: any): Promise<Member> {
    const member = await this.findOne(id);
    
    member.benefits = {
      ...member.benefits,
      ...benefitsData,
    };
    
    return this.memberRepository.save(member);
  }

  async updateCoverageDates(
    id: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Member> {
    const member = await this.findOne(id);
    
    if (startDate) {
      member.coverageStartDate = startDate;
    }
    
    if (endDate) {
      member.coverageEndDate = endDate;
    }
    
    return this.memberRepository.save(member);
  }

  async isEligible(id: string): Promise<{ eligible: boolean; reason?: string }> {
    const member = await this.findOne(id);
    
    // Check if member is active
    if (!member.isActive) {
      return { eligible: false, reason: 'Member is not active' };
    }
    
    // Check if coverage dates are valid
    const currentDate = new Date();
    
    if (member.coverageStartDate && member.coverageStartDate > currentDate) {
      return { 
        eligible: false, 
        reason: `Coverage starts on ${member.coverageStartDate.toISOString().split('T')[0]}` 
      };
    }
    
    if (member.coverageEndDate && member.coverageEndDate < currentDate) {
      return { 
        eligible: false, 
        reason: `Coverage ended on ${member.coverageEndDate.toISOString().split('T')[0]}` 
      };
    }
    
    // Check if policy product exists
    if (!member.policyProductId) {
      return { eligible: false, reason: 'No active policy product' };
    }
    
    return { eligible: true };
  }
}