// src/database/seeders/admin.seeder.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../admin/entities/admin.entity';
import { ConfigService } from '@nestjs/config';
import { UserType } from '../../common/enums/user-type.enum';
import { AdminType } from '../../common/enums/admin-type.enum';

@Injectable()
export class AdminSeeder implements OnModuleInit
{
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit()
  {
    // Add delay to ensure migrations complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.seed();
  }

  private async tableExists(): Promise<boolean>
  {
    try
    {
      const result = await this.adminRepository.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admins'
        )`
      );
      return result[0]?.exists ?? false;
    } catch (error)
    {
      this.logger.error('Error checking if admins table exists', error);
      return false;
    }
  }

  async seed(): Promise<void>
  {
    try
    {
      this.logger.log('Starting admin seeding process...');

      // Check if table exists first
      const tableExists = await this.tableExists();
      if (!tableExists)
      {
        this.logger.warn('Admins table does not exist. Skipping seeding.');
        return;
      }

      // Get admin credentials from config or use defaults
      const adminConfig = {
        username: this.configService.get<string>('ADMIN_USERNAME', 'admin'),
        email: this.configService.get<string>('ADMIN_EMAIL', 'admin@ehealthsuite.et'),
        password: this.configService.get<string>('ADMIN_PASSWORD', 'Admin@123'),
        firstName: this.configService.get<string>('ADMIN_FIRST_NAME', 'System'),
        lastName: this.configService.get<string>('ADMIN_LAST_NAME', 'Administrator'),
        phoneNumber: this.configService.get<string>('ADMIN_PHONE', '+251911111111'),
      };

      this.logger.debug('Using admin configuration:', {
        ...adminConfig,
        password: '*****', // Don't log actual password
      });

      // Delete existing admin if any
      const deleteResult = await this.adminRepository.delete({ username: adminConfig.username });
      if (deleteResult.affected)
      {
        this.logger.log(`Deleted ${deleteResult.affected} existing admin accounts`);
      }

      // Hash password
      const saltRoundsEnv = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
      const saltRounds = saltRoundsEnv && !isNaN(Number(saltRoundsEnv))
        ? parseInt(saltRoundsEnv, 10)
        : 10;

      const hashedPassword = await bcrypt.hash(adminConfig.password, saltRounds);
      this.logger.debug('Password hashed successfully');

      // Create and save admin
      const admin = new Admin();
      admin.username = adminConfig.username;
      admin.email = adminConfig.email;
      admin.password = hashedPassword;
      admin.firstName = adminConfig.firstName;
      admin.lastName = adminConfig.lastName;
      admin.phoneNumber = adminConfig.phoneNumber;
      admin.userType = UserType.ADMIN;
      admin.adminType = AdminType.SYSTEM_ADMIN;
      admin.isActive = true;

      const savedAdmin = await this.adminRepository.save(admin);
      this.logger.log('Admin created successfully', {
        id: savedAdmin.id,
        username: savedAdmin.username,
        email: savedAdmin.email,
      });

      // Verify password
      const verifyAdmin = await this.adminRepository
        .createQueryBuilder('admin')
        .select([
          'admin.id',
          'admin.username',
          'admin.password',
          'admin.userType',
          'admin.adminType',
          'admin.isActive',
        ])
        .where('admin.username = :username', { username: adminConfig.username })
        .getOne();

      if (verifyAdmin)
      {
        const passwordValid = await bcrypt.compare(adminConfig.password, verifyAdmin.password);
        this.logger.log('Admin verification:', {
          exists: true,
          passwordValid,
          adminType: verifyAdmin.adminType,
          isActive: verifyAdmin.isActive,
        });
      } else
      {
        this.logger.error('Failed to verify admin creation');
        throw new Error('Admin creation verification failed');
      }
    } catch (error)
    {
      this.logger.error('Admin seeding failed', error.stack);
      // Don't throw error to prevent app from crashing
    }
  }
}
