import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const aiActionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation limit reached. Please wait a moment.' },
});
