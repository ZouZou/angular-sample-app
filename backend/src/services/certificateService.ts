import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { Enrollment } from '../entities/Enrollment';
import { AppError } from '../middleware/errorHandler';

export class CertificateService {
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private certificatesDir = path.join(__dirname, '../../uploads/certificates');

  async generateCertificate(enrollmentId: number): Promise<string> {
    // Get enrollment with related user and course
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['user', 'course']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== 'completed') {
      throw new AppError('Course must be completed to generate certificate', 400);
    }

    if (!enrollment.completedAt) {
      throw new AppError('Completion date not found', 400);
    }

    // Check if certificate already exists
    if (enrollment.certificateUrl) {
      return enrollment.certificateUrl;
    }

    // Generate unique certificate ID
    const certificateId = uuidv4();
    const fileName = `certificate-${enrollmentId}-${certificateId}.pdf`;
    const filePath = path.join(this.certificatesDir, fileName);

    // Ensure certificates directory exists
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Pipe PDF to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Design certificate
    this.designCertificate(doc, {
      studentName: enrollment.user.name,
      courseName: enrollment.course.title,
      completionDate: enrollment.completedAt,
      certificateId
    });

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    // Update enrollment with certificate URL
    const certificateUrl = `/api/certificates/${enrollmentId}`;
    enrollment.certificateUrl = certificateUrl;
    await this.enrollmentRepository.save(enrollment);

    return certificateUrl;
  }

  private designCertificate(
    doc: PDFKit.PDFDocument,
    data: {
      studentName: string;
      courseName: string;
      completionDate: Date;
      certificateId: string;
    }
  ) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Add decorative border
    doc
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .lineWidth(3)
      .strokeColor('#2c3e50')
      .stroke();

    doc
      .rect(40, 40, pageWidth - 80, pageHeight - 80)
      .lineWidth(1)
      .strokeColor('#3498db')
      .stroke();

    // Title
    doc
      .font('Helvetica-Bold')
      .fontSize(48)
      .fillColor('#2c3e50')
      .text('CERTIFICATE OF COMPLETION', 0, 120, {
        align: 'center',
        width: pageWidth
      });

    // Decorative line
    doc
      .moveTo(pageWidth / 2 - 150, 180)
      .lineTo(pageWidth / 2 + 150, 180)
      .lineWidth(2)
      .strokeColor('#3498db')
      .stroke();

    // "This certifies that" text
    doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('#555')
      .text('This certifies that', 0, 220, {
        align: 'center',
        width: pageWidth
      });

    // Student name
    doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .fillColor('#2c3e50')
      .text(data.studentName, 0, 260, {
        align: 'center',
        width: pageWidth
      });

    // "has successfully completed" text
    doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('#555')
      .text('has successfully completed', 0, 310, {
        align: 'center',
        width: pageWidth
      });

    // Course name
    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#3498db')
      .text(data.courseName, 0, 350, {
        align: 'center',
        width: pageWidth
      });

    // Completion date
    const dateFormatted = new Date(data.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text(`Completed on ${dateFormatted}`, 0, 420, {
        align: 'center',
        width: pageWidth
      });

    // Certificate ID (bottom)
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#999')
      .text(`Certificate ID: ${data.certificateId}`, 0, pageHeight - 80, {
        align: 'center',
        width: pageWidth
      });
  }

  async getCertificateFilePath(enrollmentId: number): Promise<string> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (!enrollment.certificateUrl) {
      throw new AppError('Certificate not generated yet', 404);
    }

    // Find the certificate file
    const files = fs.readdirSync(this.certificatesDir);
    const certificateFile = files.find(file => file.startsWith(`certificate-${enrollmentId}-`));

    if (!certificateFile) {
      throw new AppError('Certificate file not found', 404);
    }

    return path.join(this.certificatesDir, certificateFile);
  }

  async deleteCertificate(enrollmentId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.certificateUrl) {
      // Find and delete the certificate file
      const files = fs.readdirSync(this.certificatesDir);
      const certificateFile = files.find(file => file.startsWith(`certificate-${enrollmentId}-`));

      if (certificateFile) {
        const filePath = path.join(this.certificatesDir, certificateFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Clear certificate URL from enrollment
      enrollment.certificateUrl = undefined;
      await this.enrollmentRepository.save(enrollment);
    }
  }
}
