//src/auth/guards/admin-types.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminType } from '../../common/enums/admin-type.enum';
import { ADMIN_TYPES_KEY } from '../decorators/admin-types.decorator';
import { UserType } from '../../common/enums/user-type.enum';

@Injectable()
export class AdminTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAdminTypes = this.reflector.getAllAndOverride<AdminType[]>(
      ADMIN_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAdminTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // First check if user is an admin
    if (user.userType !== UserType.ADMIN) {
      return false;
    }

    return requiredAdminTypes.includes(user.adminType);
  }
}
