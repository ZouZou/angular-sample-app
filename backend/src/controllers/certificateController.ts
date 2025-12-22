import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificateService';
import { AppError } from '../middleware/errorHandler';

const certificateService = new CertificateService();

export class CertificateController {
  async generateCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId) {
        throw new AppError('Enrollment ID is required', 400);
      }

      const certificateUrl = await certificateService.generateCertificate(parseInt(enrollmentId));
      res.status(201).json({ certificateUrl });
    } catch (error) {
      next(error);
    }
  }

  async downloadCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId) {
        throw new AppError('Enrollment ID is required', 400);
      }

      const filePath = await certificateService.getCertificateFilePath(parseInt(enrollmentId));

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${enrollmentId}.pdf"`);

      // Stream the file
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  async viewCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId) {
        throw new AppError('Enrollment ID is required', 400);
      }

      const filePath = await certificateService.getCertificateFilePath(parseInt(enrollmentId));

      // Set headers for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="certificate-${enrollmentId}.pdf"`);

      // Stream the file
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  async deleteCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId) {
        throw new AppError('Enrollment ID is required', 400);
      }

      await certificateService.deleteCertificate(parseInt(enrollmentId));
      res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
