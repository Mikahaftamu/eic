import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Member } from '../members/entities/member.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Admin } from '../admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { UserType } from '../common/enums/user-type.enum';
import { HealthFacilityType } from '../providers/enums/health-facility-type.enum';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    // Try to find admin first since we know it's an admin login
    let user: any = await this.adminRepository
      .createQueryBuilder('admin')
      .select([
        'admin.id',
        'admin.username',
        'admin.email',
        'admin.password', // Explicitly select password
        'admin.userType',
        'admin.adminType',
        'admin.firstName',
        'admin.lastName',
        'admin.phoneNumber',
        'admin.isActive',
        'admin.lastLoginAt',
        'admin.insuranceCompanyId'
      ])
      .where('admin.username = :username', { username })
      .getOne();


    if (!user) {
      // Check other repositories if admin not found
      user = await this.memberRepository
        .createQueryBuilder('member')
        .select([
          'member.id',
          'member.username',
          'member.email',
          'member.password',
          'member.userType',
          'member.firstName',
          'member.lastName',
          'member.phoneNumber',
          'member.isActive',
          'member.lastLoginAt',
          'member.insuranceCompanyId'
        ])
        .where('member.username = :username', { username })
        .getOne();

      if (!user) {
        user = await this.providerRepository
          .createQueryBuilder('provider')
          .select([
            'provider.id',
            'provider.username',
            'provider.email',
            'provider.password',
            'provider.userType',
            'provider.firstName',
            'provider.lastName',
            'provider.phoneNumber',
            'provider.isActive',
            'provider.lastLoginAt',
            'provider.insuranceCompanyId'
          ])
          .where('provider.username = :username', { username })
          .getOne();
      }

      if (!user) {
        user = await this.staffRepository
          .createQueryBuilder('staff')
          .select([
            'staff.id',
            'staff.username',
            'staff.email',
            'staff.password',
            'staff.userType',
            'staff.firstName',
            'staff.lastName',
            'staff.phoneNumber',
            'staff.isActive',
            'staff.lastLoginAt',
            'staff.insuranceCompanyId',
            'staff.roles',
            'staff.permissions'
          ])
          .where('staff.username = :username', { username })
          .getOne();
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    // Find user and validate credentials
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    // Update last login time
    user.lastLoginAt = new Date();
    switch (user.userType) {
      case UserType.MEMBER:
        await this.memberRepository.save(user);
        break;
      case UserType.PROVIDER:
        await this.providerRepository.save(user);
        break;
      case UserType.STAFF:
        await this.staffRepository.save(user);
        break;
      case UserType.ADMIN:
        await this.adminRepository.save(user);
        break;
    }

    // Generate JWT token with proper claims
    const payload = {
      sub: user.id,  // This is the user ID
      id: user.id,   // Also include as id field
      username: user.username,
      email: user.email,
      userType: user.userType,
      insuranceCompanyId: user.insuranceCompanyId,
      adminType: user.userType === UserType.ADMIN ? (user as Admin).adminType : undefined,
      roles: user.userType === UserType.STAFF ? (user as Staff).roles : undefined,
      permissions: user.userType === UserType.STAFF ? (user as Staff).permissions : undefined
    };

    // Log the payload for debugging
    console.log('JWT Payload:', JSON.stringify(payload, null, 2));

    const token = this.jwtService.sign(payload, {
      expiresIn: '1d',
      algorithm: 'HS256'
    });

    return {
      access_token: token,
      user: {
        id: user.id,  // Include user ID in the response
        username: user.username,
        email: user.email,
        userType: user.userType,
        insuranceCompanyId: user.insuranceCompanyId,
        adminType: user.userType === UserType.ADMIN ? (user as Admin).adminType : undefined,
        roles: user.userType === UserType.STAFF ? (user as Staff).roles : undefined,
        permissions: user.userType === UserType.STAFF ? (user as Staff).permissions : undefined
      }
    };
  }

  async registerMember(dto: RegisterMemberDto) {
    await this.checkUsernameAvailability(dto.username);
    if (dto.email) {
      await this.checkEmailAvailability(dto.email);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const member = new Member();
    member.username = dto.username;
    member.email = dto.email || '';
    member.password = hashedPassword;
    member.firstName = dto.firstName;
    member.lastName = dto.lastName;
    member.phoneNumber = dto.phoneNumber;
    member.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : new Date();
    member.gender = dto.gender || '';
    member.nationalId = dto.nationalId;
    member.employerId = dto.employerId || '';
    if (dto.address && dto.city && dto.region) {
      member.address = {
        street: dto.address,
        city: dto.city,
        state: dto.region,
        country: 'Ethiopia',
        postalCode: '',
      };
    }

    const savedMember = await this.memberRepository.save(member);
    return this.login(savedMember);
  }

  async registerStaff(dto: RegisterStaffDto) {
    await this.checkUsernameAvailability(dto.username);
    if (dto.email) {
      await this.checkEmailAvailability(dto.email);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const staff = new Staff();
    staff.username = dto.username;
    staff.email = dto.email || null;
    staff.password = hashedPassword;
    staff.firstName = dto.firstName;
    staff.lastName = dto.lastName;
    staff.phoneNumber = dto.phoneNumber;
    staff.employeeId = dto.employeeId;
    staff.department = dto.department || null;
    staff.position = dto.position || null;
    staff.roles = [dto.role];
    staff.insuranceCompanyId = dto.insuranceCompanyId;
    staff.permissions = dto.permissions || {};
    staff.supervisorId = dto.supervisor || '';

    return this.staffRepository.save(staff);
  }

  async registerProvider(dto: RegisterProviderDto, req: RequestWithUser) {
    // Check if username exists
    const existingUser = await this.checkUsernameAvailability(dto.username);
    if (!existingUser.available) {
      throw new ConflictException('Username already exists');
    }

    // Check if email exists
    if (dto.email) {
      const existingEmail = await this.checkEmailAvailability(dto.email);
      if (!existingEmail.available) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Create provider
    const provider = this.providerRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      userType: UserType.PROVIDER,
      facilityName: dto.facilityName,
      name: dto.facilityName,
      phone: dto.phoneNumber,
      address: dto.location.address,
      category: dto.category,
      facilityType: dto.facilityType,
      healthFacilityType: dto.facilityType || HealthFacilityType.PRIMARY_HOSPITAL,
      licenseNumber: dto.licenseNumber,
      licenseExpiryDate: new Date(dto.licenseExpiryDate),
      taxId: dto.taxId,
      location: {
        ...dto.location,
        latitude: 0,
        longitude: 0
      },
      specialties: [],
      services: [],
      facilityServices: [],
      active: true,
      isActive: true,
      insuranceCompanyId: req.user.insuranceCompanyId // Set from staff's insurance company
    });

    return this.providerRepository.save(provider);
  }

  private async checkUsernameAvailability(username: string) {
    const existingUser = await Promise.all([
      this.memberRepository
        .createQueryBuilder('member')
        .select('member.id')
        .where('member.username = :username', { username })
        .getOne(),
      this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.id')
        .where('provider.username = :username', { username })
        .getOne(),
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.id')
        .where('staff.username = :username', { username })
        .getOne(),
      this.adminRepository
        .createQueryBuilder('admin')
        .select('admin.id')
        .where('admin.username = :username', { username })
        .getOne(),
    ]);

    if (existingUser.some(user => user !== null)) {
      return { available: false };
    }
    return { available: true };
  }

  private async checkEmailAvailability(email: string) {
    const existingUser = await Promise.all([
      this.memberRepository
        .createQueryBuilder('member')
        .select('member.id')
        .where('member.email = :email', { email })
        .getOne(),
      this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.id')
        .where('provider.email = :email', { email })
        .getOne(),
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.id')
        .where('staff.email = :email', { email })
        .getOne(),
      this.adminRepository
        .createQueryBuilder('admin')
        .select('admin.id')
        .where('admin.email = :email', { email })
        .getOne(),
    ]);

    if (existingUser.some(user => user !== null)) {
      return { available: false };
    }
    return { available: true };
  }
}
