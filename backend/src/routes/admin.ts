import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as complaintService from '../services/complaintService';

const router = Router();

// Simple admin auth middleware
const adminAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET /api/admin/complaints — list all complaints for admin
router.get('/complaints', adminAuth, asyncHandler(async (req, res) => {
  const complaints = await complaintService.getComplaints();
  res.json(complaints);
}));

// PATCH /api/admin/complaints/:id — update complaint status
router.patch('/complaints/:id', adminAuth, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const updated = await complaintService.updateComplaintStatus(req.params.id, status, notes);
  if (!updated) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json(updated);
}));

// DELETE /api/admin/complaints/:id — delete complaint
router.delete('/complaints/:id', adminAuth, asyncHandler(async (req, res) => {
  const deleted = await complaintService.deleteComplaint(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json({ message: 'Complaint deleted successfully' });
}));

export const adminRoutes = router;
