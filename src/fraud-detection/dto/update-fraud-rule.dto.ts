import { PartialType } from '@nestjs/swagger';
import { CreateFraudRuleDto } from './create-fraud-rule.dto';

export class UpdateFraudRuleDto extends PartialType(CreateFraudRuleDto) {}
