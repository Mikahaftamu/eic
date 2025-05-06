import { Injectable } from '@nestjs/common';
import { Member } from '../entities/member.entity';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';

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
    // Create a new PDF document with half A4 dimensions (210mm x 148.5mm)
    const doc = new PDFDocument({
      size: [595, 421], // 210mm x 148.5mm in points (1mm = 2.83465 points)
      margin: 20,
      layout: 'landscape',
      info: {
        Title: `ID Card - ${member.firstName} ${member.lastName}`,
        Author: 'E-Health Insurance',
        Subject: 'Insurance ID Card',
      }
    });

    // Buffer to store the PDF data
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // Add background color
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#ffffff');

    // Add border
    doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10)
       .stroke('#0d6efd');

    // Add insurance company logo and information (top section)
    await this.addInsuranceCompanyInfo(doc, member);

    // Add member information
    this.addMemberInfo(doc, member);

    // Add benefits information
    this.addBenefitsInfo(doc, member);

    // Add dependents information if requested
    if (options.includeDependents && member.dependents && member.dependents.length > 0) {
      this.addDependentsInfo(doc, member);
    }

    // Add footer with important information
    this.addFooter(doc, member);

    // Add QR code if requested (bottom right corner)
    if (options.includeQRCode) {
      await this.addQRCode(doc, member);
    }

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
    // Add company name with styling
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#0d6efd')
       .text('E-HEALTH INSURANCE', { align: 'center' });

    // Add policy product information
    if (member.benefits?.planType) {
      doc.moveDown(0.3)
         .fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#0d6efd')
         .text(`Policy Product: ${member.benefits.planType}`, { align: 'center' });
    }

    // Add a decorative line
    doc.moveDown(0.3)
       .strokeColor('#dee2e6')
       .lineWidth(0.5)
       .moveTo(40, doc.y)
       .lineTo(doc.page.width - 40, doc.y)
       .stroke();
  }

  private addMemberInfo(doc: typeof PDFDocument.prototype, member: Member): void {
    // Add member name with styling
    doc.moveDown(0.3)
       .fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#212529')
       .text(`${member.firstName} ${member.lastName}`);

    // Add member details
    doc.moveDown(0.2)
       .fontSize(14)
       .font('Helvetica')
       .fillColor('#495057');

    // Add member ID and DOB on separate lines for better readability
    doc.text(`Member ID: ${member.id}`);
    
    if (member.dateOfBirth) {
      doc.text(`Date of Birth: ${new Date(member.dateOfBirth).toLocaleDateString()}`);
    }

    // Add coverage dates
    if (member.coverageStartDate) {
      const startDate = new Date(member.coverageStartDate).toLocaleDateString();
      let coverageDates = `Coverage Period: ${startDate}`;
      
      if (member.coverageEndDate) {
        const endDate = new Date(member.coverageEndDate).toLocaleDateString();
        coverageDates += ` to ${endDate}`;
      }
      
      doc.text(coverageDates);
    }

    // Add policy product
    if (member.benefits?.planType) {
      doc.moveDown(0.2)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(`Policy Product: ${member.benefits.planType}`);
    }
  }

  private addBenefitsInfo(doc: typeof PDFDocument.prototype, member: Member): void {
    if (member.benefits) {
      doc.moveDown(0.3)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Benefits Information:')
         .fontSize(13)
         .font('Helvetica');
      
      // Create benefits summary
      const benefitsSummary: string[] = [];
      
      if (member.benefits.coverageLevel) {
        benefitsSummary.push(`Coverage Level: ${member.benefits.coverageLevel}`);
      }

      // Add coverage details
      const coverageDetails: string[] = [];
      if (member.benefits.prescriptionCoverage) coverageDetails.push('Prescription');
      if (member.benefits.dentalCoverage) coverageDetails.push('Dental');
      if (member.benefits.visionCoverage) coverageDetails.push('Vision');
      
      if (coverageDetails.length > 0) {
        benefitsSummary.push(`Coverage Includes: ${coverageDetails.join(', ')}`);
      }

      // Add copay and deductible
      if (member.benefits.copay) {
        benefitsSummary.push(`Copay: $${member.benefits.copay}`);
      }
      if (member.benefits.deductible) {
        benefitsSummary.push(`Deductible: $${member.benefits.deductible}`);
      }

      // Display benefits in a more readable format
      benefitsSummary.forEach(benefit => {
        doc.text(benefit);
      });
    }
  }

  private async addQRCode(doc: typeof PDFDocument.prototype, member: Member): Promise<void> {
    // Generate a QR code with the member's ID for verification
    const qrCodeData = `MEMBER:${member.id}`;
    
    try {
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 100,
        color: {
          dark: '#0d6efd',
          light: '#ffffff'
        }
      });
      
      // Position the QR code in the bottom right corner
      doc.image(qrCodeImage, doc.page.width - 120, doc.page.height - 120, { width: 100 });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private addDependentsInfo(doc: typeof PDFDocument.prototype, member: Member): void {
    doc.moveDown(0.3)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Covered Dependents:')
       .fontSize(13)
       .font('Helvetica');
    
    // Create a list of dependents
    member.dependents.slice(0, 2).forEach(dependent => {
      doc.text(`${dependent.firstName} ${dependent.lastName} (${dependent.relationship})`);
    });
    
    if (member.dependents.length > 2) {
      doc.text(`Additional ${member.dependents.length - 2} dependents covered`);
    }
  }

  private addFooter(doc: typeof PDFDocument.prototype, member: Member): void {
    // Add a decorative line
    doc.moveDown(0.3)
       .strokeColor('#dee2e6')
       .lineWidth(0.5)
       .moveTo(40, doc.y)
       .lineTo(doc.page.width - 40, doc.y)
       .stroke();

    // Add insurance company name in footer
    doc.moveDown(0.2)
       .fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#0d6efd')
       .text('E-HEALTH INSURANCE', { align: 'center' });

    // Add policy product in footer
    if (member.benefits?.planType) {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#6c757d')
         .text(`Policy Product: ${member.benefits.planType}`, { align: 'center' });
    }

    // Add emergency contact information
    doc.moveDown(0.2)
       .fontSize(13)
       .font('Helvetica')
       .fillColor('#6c757d')
       .text('Emergency Contact: 911', { align: 'center' });

    // Add customer service information
    doc.text('Customer Service: 1-800-HEALTH-1', { align: 'center' });

    // Add disclaimer
    doc.text('This card does not guarantee coverage. Contact customer service for verification.', { align: 'center' });
  }
}
