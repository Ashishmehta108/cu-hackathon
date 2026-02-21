import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/authService';

const router = Router();

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 * Body: { phone: string }
 */
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  const result = await authService.sendOTP(phone);
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ error: result.message });
  }
}));

/**
 * Verify OTP and return auth token
 * POST /api/auth/verify-otp
 * Body: { phone: string, otp: string }
 */
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP required' });
  }

  const result = await authService.verifyOTP(phone, otp);
  if (result.success && result.token) {
    res.json({ message: result.message, token: result.token });
  } else {
    res.status(400).json({ error: result.message });
  }
}));

export const authRoutes = router;
