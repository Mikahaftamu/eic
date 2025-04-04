import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { AdminType } from '../common/enums/admin-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async createAdmin(data: {
    username: string;
    password: string;
    email: string | null;
    adminType: AdminType;
    insuranceCompanyId: string;
    corporateClientId?: string;
  }): Promise<Admin> {
    // Check if admin with same username exists
    const existing = await this.adminRepository.findOne({
      where: { username: data.username }
    });

    if (existing) {
      throw new ConflictException('Admin with this username already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create the admin
    const admin = this.adminRepository.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
      adminType: data.adminType,
      insuranceCompanyId: data.insuranceCompanyId,
      corporateClientId: data.corporateClientId
    });

    return this.adminRepository.save(admin);
  }

  async resetInsuranceAdminPassword(currentAdmin: Admin, resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Verify that the current admin is a system admin
    if (currentAdmin.adminType !== AdminType.SYSTEM_ADMIN) {
      throw new UnauthorizedException('Only system admins can reset passwords');
    }

    // Find the insurance admin
    const insuranceAdmin = await this.adminRepository.findOne({
      where: { 
        id: resetPasswordDto.adminId,
        adminType: AdminType.INSURANCE_ADMIN
      }
    });

    if (!insuranceAdmin) {
      throw new NotFoundException('Insurance company admin not found');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, salt);

    // Update the password
    insuranceAdmin.password = hashedPassword;
    await this.adminRepository.save(insuranceAdmin);
  }

  async findInsuranceAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({
      where: { 
        adminType: AdminType.INSURANCE_ADMIN 
      },
      relations: ['insuranceCompany'],
      select: {
        id: true,
        username: true,
        email: true,
        adminType: true,
        createdAt: true,
        updatedAt: true,
        insuranceCompanyId: true,
        insuranceCompany: {
          id: true,
          name: true,
          code: true,
          email: true,
          isActive: true
        }
      }
    });
  }

  async findInsuranceAdminsByCompany(insuranceCompanyId: string): Promise<Admin[]> {
    return this.adminRepository.find({
      where: { 
        adminType: AdminType.INSURANCE_ADMIN,
        insuranceCompanyId
      },
      relations: ['insuranceCompany'],
      select: {
        id: true,
        username: true,
        email: true,
        adminType: true,
        createdAt: true,
        updatedAt: true,
        insuranceCompanyId: true,
        insuranceCompany: {
          id: true,
          name: true,
          code: true,
          email: true,
          isActive: true
        }
      }
    });
  }
}
