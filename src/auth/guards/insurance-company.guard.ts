//src/auth/guards/insurance-company.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../common/enums/user-type.enum';

@Injectable()
export class InsuranceCompanyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin can access all companies
    if (user.userType === UserType.ADMIN) {
      return true;
    }

    // Get the insurance company ID from the request parameters or body
    const companyId = request.params.insuranceCompanyId || request.body.insuranceCompanyId;

    // If no company ID is provided, allow access (it will be filtered at the service level)
    if (!companyId) {
      return true;
    }

    // Check if the user belongs to the requested insurance company
    if (user.insuranceCompanyId !== companyId) {
      throw new ForbiddenException('You can only access data from your own insurance company');
    }

    return true;
  }
}
