import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API endpoints: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP. Please try again after a few minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// Stricter rate limiter for expensive AI & GitHub analysis operations: 30 requests per 10 minutes
export const analysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Analysis and AI request rate limit reached. Please wait a few minutes before trying again.',
      code: 'AI_RATE_LIMIT_EXCEEDED'
    }
  }
});
