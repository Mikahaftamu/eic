import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  // All fields from CreateMemberDto will be optional
  // policyProductId is inherited from CreateMemberDto
}
