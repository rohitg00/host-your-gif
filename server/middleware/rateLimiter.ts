import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Don't count failed requests
  trustProxy: false, // Disable trust proxy for rate limiter
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For header if available, otherwise use IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor?.[0]) || req.ip;
    return ip;
  },
});

// More strict rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Don't count failed requests
  trustProxy: false, // Disable trust proxy for rate limiter
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For header if available, otherwise use IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor?.[0]) || req.ip;
    return ip;
  },
});
