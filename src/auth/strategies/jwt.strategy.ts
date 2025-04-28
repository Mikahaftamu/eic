import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserType } from '../../common/enums/user-type.enum';

interface StaffPermissions {
  claims?: {
    view?: boolean;
    process?: boolean;
    approve?: boolean;
    deny?: boolean;
  };
  policies?: {
    view?: boolean;
    create?: boolean;
    modify?: boolean;
    terminate?: boolean;
  };
  providers?: {
    view?: boolean;
    create?: boolean;
    modify?: boolean;
    deactivate?: boolean;
  };
  reports?: {
    view?: boolean;
    generate?: boolean;
    export?: boolean;
  };
}

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  userType: UserType;
  insuranceCompanyId: string;
  adminType?: string;
  roles?: string[];
  permissions?: StaffPermissions;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    try {
      if (!payload.sub || !payload.username || !payload.userType) {
        throw new UnauthorizedException('Invalid token payload');
      }

    return {
        sub: payload.sub,
      username: payload.username,
      email: payload.email,
      userType: payload.userType,
      insuranceCompanyId: payload.insuranceCompanyId,
        adminType: payload.adminType,
        roles: payload.roles,
        permissions: payload.permissions
    };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
