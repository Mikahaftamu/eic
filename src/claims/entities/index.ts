import { Claim } from './claim.entity';
import { ClaimItem } from './claim-item.entity';
import { ClaimAdjustment } from './claim-adjustment.entity';
import { ClaimAppeal } from './claim-appeal.entity';

export * from './claim.entity';
export * from './claim-item.entity';
export * from './claim-adjustment.entity';
export * from './claim-appeal.entity';

export const entities = [
  Claim,
  ClaimItem,
  ClaimAdjustment,
  ClaimAppeal,
];
