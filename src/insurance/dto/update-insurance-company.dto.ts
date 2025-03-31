import { PartialType } from '@nestjs/swagger';
import { CreateInsuranceCompanyDto } from './create-insurance-company.dto';

export class UpdateInsuranceCompanyDto extends PartialType(CreateInsuranceCompanyDto) {}
