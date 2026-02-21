import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { requireBody } from '../middlewares/validators';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware';
import * as complaintController from '../controllers/complaintController';

export const complaintRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET  /api/complaints           — list all (with optional ?status=&category=&village=)
complaintRoutes.get('/', asyncHandler(complaintController.list));

// GET  /api/complaints/analytics — category counts
complaintRoutes.get('/analytics', asyncHandler(complaintController.analytics));

// GET  /api/complaints/cluster-count — count in same cluster (category + location)
complaintRoutes.get('/cluster-count', asyncHandler(complaintController.clusterCount));

// GET  /api/complaints/:id — get single
complaintRoutes.get('/:id', asyncHandler(complaintController.getById));

// POST /api/complaints — create
complaintRoutes.post(
    '/',
    rateLimitMiddleware,
    upload.single('image'), // Accept image file
    requireBody('text', 'language', 'category', 'department', 'location'),
    asyncHandler(complaintController.create)
);

// PATCH /api/complaints/:id — partial update
complaintRoutes.patch('/:id', asyncHandler(complaintController.update));

// PATCH /api/complaints/:id/status — update status
complaintRoutes.patch(
    '/:id/status',
    requireBody('status'),
    asyncHandler(complaintController.updateStatus)
);

// DELETE /api/complaints/:id
complaintRoutes.delete('/:id', asyncHandler(complaintController.remove));
