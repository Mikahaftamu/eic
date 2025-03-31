import { PartialType } from '@nestjs/swagger';
import { CreatePolicyProductDto } from './create-policy-product.dto';

export class UpdatePolicyProductDto extends PartialType(CreatePolicyProductDto) {}
