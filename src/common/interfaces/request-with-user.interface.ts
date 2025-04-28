import { Request } from 'express';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';
 
export interface RequestWithUser extends Request {
  user: JwtPayload;
} 