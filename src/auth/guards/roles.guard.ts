import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../common/enums/user-type.enum';

interface RequestUser {
  id: string;
  username: string;
  email: string;
  userType: UserType;
  adminType?: string;
  roles?: string[];
  insuranceCompanyId: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserType[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    
    if (!user) {
      return false;
    }

    // If user is an admin, allow access
    if (user.userType === UserType.ADMIN) {
      return true;
    }
    
    // For non-admin users, check userType
    return requiredRoles.includes(user.userType);
  }
}
