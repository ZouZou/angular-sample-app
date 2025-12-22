import { Router } from 'express';
import { CertificateController } from '../controllers/certificateController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const certificateController = new CertificateController();

// Generate certificate for completed enrollment
router.post('/:enrollmentId/generate', authenticate, (req, res, next) =>
  certificateController.generateCertificate(req, res, next)
);

// View certificate (inline in browser)
router.get('/:enrollmentId', (req, res, next) =>
  certificateController.viewCertificate(req, res, next)
);

// Download certificate
router.get('/:enrollmentId/download', (req, res, next) =>
  certificateController.downloadCertificate(req, res, next)
);

// Delete certificate (admin/instructor only)
router.delete('/:enrollmentId', authenticate, authorize('admin', 'instructor'), (req, res, next) =>
  certificateController.deleteCertificate(req, res, next)
);

export default router;
