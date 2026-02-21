import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: { phone: string };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [phone, token] = authHeader.substring(7).split(':');
    if (!phone || !token) {
      return res.status(401).json({ error: 'Invalid auth format' });
    }

    const isValid = await authService.validateToken(phone, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { phone }; // Add user to request
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
