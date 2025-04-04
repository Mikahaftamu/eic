import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Res,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { IDCardService } from '../services/id-card.service';
import { MembersService } from '../members.service';

@ApiTags('id-cards')
@Controller('members/:memberId/id-card')
@ApiBearerAuth()
export class IDCardController {
  constructor(
    private readonly idCardService: IDCardService,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Generate ID card for a member' })
  @ApiQuery({ name: 'includeQRCode', required: false, type: Boolean })
  @ApiQuery({ name: 'includeDependents', required: false, type: Boolean })
  @ApiQuery({ name: 'includePhoto', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Returns the ID card as a PDF file',
    content: {
      'application/pdf': {},
    },
  })
  async generateIDCard(
    @Param('memberId') memberId: string,
    @Query('includeQRCode') includeQRCode?: string,
    @Query('includeDependents') includeDependents?: string,
    @Query('includePhoto') includePhoto?: string,
    @Request() req?: any,
    @Res() res?: Response,
  ): Promise<void> {
    if (!req || !res) {
      throw new BadRequestException('Invalid request');
    }

    const member = await this.membersService.findOne(memberId);

    // Members can only generate their own ID card
    if (req.user.userType === UserType.MEMBER && req.user.id !== memberId) {
      throw new ForbiddenException('You can only generate your own ID card');
    }

    // Staff can only generate ID cards for members from their insurance company
    if (req.user.userType === UserType.STAFF && 
        member.insuranceCompanyId !== req.user.insuranceCompanyId) {
      throw new ForbiddenException('You can only generate ID cards for members from your insurance company');
    }

    // Check if member is eligible
    const eligibility = await this.membersService.isEligible(memberId);
    if (!eligibility.eligible) {
      throw new BadRequestException(`Cannot generate ID card: ${eligibility.reason}`);
    }

    // Parse query parameters
    const options = {
      includeQRCode: includeQRCode === 'true',
      includeDependents: includeDependents === 'true',
      includePhoto: includePhoto === 'true',
    };

    // Generate the ID card
    const pdfBuffer = await this.idCardService.generateIDCard(member, options);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="id-card-${memberId}.pdf"`);
    
    // Send the PDF file
    res.send(pdfBuffer);
  }
}
