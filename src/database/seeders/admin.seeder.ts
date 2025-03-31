import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../admin/entities/admin.entity';
import { ConfigService } from '@nestjs/config';
import { UserType } from '../../common/enums/user-type.enum';
import { AdminType } from '../../common/enums/admin-type.enum';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    try {
      console.log('Starting admin seeding process...');
      
      // Delete existing admin if any
      await this.adminRepository.delete({ username: 'admin' });
      console.log('Deleted existing admin if any');

      // Create a new admin with a known password
      const adminPassword = 'Admin@123';
      console.log('Using admin password:', adminPassword);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      console.log('Password hashed successfully');

      // Test password verification immediately
      const testVerify = await bcrypt.compare(adminPassword, hashedPassword);
      console.log('Test password verification before saving:', testVerify);

      // Create a new admin instance
      const admin = new Admin();
      admin.username = 'admin';
      admin.email = 'admin@ehealthsuite.et';
      admin.password = hashedPassword;
      admin.firstName = 'System';
      admin.lastName = 'Administrator';
      admin.phoneNumber = '+251911111111';
      admin.userType = UserType.ADMIN;
      admin.adminType = AdminType.SYSTEM_ADMIN;
      admin.isActive = true;

      const savedAdmin = await this.adminRepository.save(admin);
      console.log('Admin saved successfully:', {
        id: savedAdmin.id,
        username: savedAdmin.username,
        userType: savedAdmin.userType,
        adminType: savedAdmin.adminType,
        isActive: savedAdmin.isActive
      });

      // Verify the admin was created with a password comparison
      const verifyAdmin = await this.adminRepository
        .createQueryBuilder('admin')
        .select([
          'admin.id',
          'admin.username',
          'admin.password',
          'admin.userType',
          'admin.adminType',
          'admin.isActive'
        ])
        .where('admin.username = :username', { username: 'admin' })
        .getOne();
      
      if (verifyAdmin) {
        console.log('Stored password hash:', verifyAdmin.password);
        const passwordValid = await bcrypt.compare(adminPassword, verifyAdmin.password);
        console.log('Verify admin exists and password is valid:', passwordValid);
      } else {
        console.log('Failed to verify admin creation');
      }
    } catch (error) {
      console.error('Error during admin seeding:', error);
      throw error;
    }
  }
}
