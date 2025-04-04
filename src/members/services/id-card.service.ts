import { Injectable } from '@nestjs/common';
import { Member } from '../entities/member.entity';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

interface IDCardOptions {
  includeQRCode?: boolean;
  includeDependents?: boolean;
  includePhoto?: boolean;
}

@Injectable()
export class IDCardService {
  async generateIDCard(
    member: Member,
    options: IDCardOptions = { includeQRCode: true, includeDependents: false, includePhoto: false }
  ): Promise<Buffer> {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'credit-card', // Standard credit card size
      margin: 10,
    });

    // Buffer to store the PDF data
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // Add insurance company logo and information
    await this.addInsuranceCompanyInfo(doc, member);

    // Add member information
    this.addMemberInfo(doc, member);

    // Add QR code if requested
    if (options.includeQRCode) {
      await this.addQRCode(doc, member);
    }

    // Add dependents information if requested
    if (options.includeDependents && member.dependents && member.dependents.length > 0) {
      this.addDependentsInfo(doc, member);
    }

    // Add photo if requested
    if (options.includePhoto) {
      // This would require a photo to be stored for the member
      // await this.addMemberPhoto(doc, member);
    }

    // Add footer with important information
    this.addFooter(doc, member);

    // Finalize the PDF
    doc.end();

    // Return a promise that resolves with the PDF data
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  private async addInsuranceCompanyInfo(doc: typeof PDFDocument.prototype, member: Member): Promise<void> {
    // In a real implementation, you would fetch the insurance company details
    // and logo from the database or a file storage service
    
    // For now, we'll just add a placeholder
    doc.fontSize(10).font('Helvetica-Bold').text('HEALTH INSURANCE', { align: 'center' });
    doc.moveDown(0.5);
  }

  private addMemberInfo(doc: typeof PDFDocument.prototype, member: Member): void {
    // Add member name
    doc.fontSize(8).font('Helvetica-Bold').text(`${member.firstName} ${member.lastName}`);
    
    // Add member ID
    doc.fontSize(7).font('Helvetica').text(`Member ID: ${member.id}`);
    
    // Add policy number
    if (member.policyNumber) {
      doc.text(`Policy #: ${member.policyNumber}`);
    }
    
    // Add coverage dates
    if (member.coverageStartDate) {
      const startDate = new Date(member.coverageStartDate).toLocaleDateString();
      let coverageDates = `Coverage Start: ${startDate}`;
      
      if (member.coverageEndDate) {
        const endDate = new Date(member.coverageEndDate).toLocaleDateString();
        coverageDates += ` - End: ${endDate}`;
      }
      
      doc.text(coverageDates);
    }
    
    // Add benefits summary if available
    if (member.benefits) {
      doc.moveDown(0.5);
      doc.fontSize(7).font('Helvetica-Bold').text('Benefits Summary:');
      doc.fontSize(6).font('Helvetica');
      
      if (member.benefits.planType) {
        doc.text(`Plan: ${member.benefits.planType}`);
      }
      
      if (member.benefits.coverageLevel) {
        doc.text(`Coverage: ${member.benefits.coverageLevel}`);
      }
      
      // Add other benefit details as needed
    }
  }

  private async addQRCode(doc: typeof PDFDocument.prototype, member: Member): Promise<void> {
    // Generate a QR code with the member's ID for verification
    const qrCodeData = `MEMBER:${member.id}`;
    
    try {
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 50,
      });
      
      // Position the QR code in the top right corner
      doc.image(qrCodeImage, doc.page.width - 60, 10, { width: 50 });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private addDependentsInfo(doc: typeof PDFDocument.prototype, member: Member): void {
    doc.moveDown(1);
    doc.fontSize(7).font('Helvetica-Bold').text('Covered Dependents:');
    doc.fontSize(6).font('Helvetica');
    
    member.dependents.forEach((dependent, index) => {
      // Limit to first 3 dependents to fit on card
      if (index < 3) {
        doc.text(`${dependent.firstName} ${dependent.lastName} - ${dependent.relationship}`);
      } else if (index === 3) {
        doc.text(`+ ${member.dependents.length - 3} more`);
      }
    });
  }

  private addFooter(doc: typeof PDFDocument.prototype, member: Member): void {
    // Position at the bottom of the card
    doc.fontSize(5).font('Helvetica').text(
      'This card does not guarantee coverage. Contact customer service for verification.',
      10,
      doc.page.height - 20,
      { width: doc.page.width - 20, align: 'center' }
    );
    
    // Add customer service contact information
    doc.text(
      'Customer Service: 1-800-HEALTH-1',
      10,
      doc.page.height - 15,
      { width: doc.page.width - 20, align: 'center' }
    );
  }
}
