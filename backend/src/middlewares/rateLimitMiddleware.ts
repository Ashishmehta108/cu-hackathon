import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Request, Response, NextFunction } from 'express';

// Initialize Redis client for Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter: allow 5 requests per 15 minutes per IP
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});

// Middleware function to rate limit based on IP
export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    const { success } = await rateLimiter.limit(ip);

    if (!success) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // In case of Redis failure, allow the request to proceed to avoid blocking legitimate traffic
    next();
  }
};
