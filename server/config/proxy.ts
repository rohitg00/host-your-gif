import { type Express } from 'express';

export const configureProxy = (app: Express) => {
  // Trust first proxy - required for Sevalla deployment
  app.set('trust proxy', 1);
  
  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};
