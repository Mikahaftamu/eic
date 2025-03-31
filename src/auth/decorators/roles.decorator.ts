import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../common/enums/user-type.enum';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
