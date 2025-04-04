import { SetMetadata } from '@nestjs/common';
import { AdminType } from '../../common/enums/admin-type.enum';

export const ADMIN_TYPES_KEY = 'adminTypes';
export const AdminTypes = (...types: AdminType[]) => SetMetadata(ADMIN_TYPES_KEY, types);
