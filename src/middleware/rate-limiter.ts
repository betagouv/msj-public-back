import { RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'

export const createRateLimiter = (
  maxRequests: number,
  windowMs: number
): RequestHandler =>
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false
  })
