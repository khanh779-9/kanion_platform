/**
 * Rate Limiting Middleware
 * Prevents brute force attacks on auth endpoints
 */
const rateLimits = new Map();

const LIMITS = {
  auth: { max: 50, window: 15 * 60 * 1000 }, // 50 attempts per 15 minutes
  api: { max: 500, window: 60 * 1000 } // 500 requests per minute
};

function getKey(identifier, endpoint) {
  return `${endpoint}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now - value.resetAt > 0) {
      rateLimits.delete(key);
    }
  }
}

export function rateLimit(endpoint = 'api') {
  return (req, res, next) => {
    cleanup();
    
    const limit = LIMITS[endpoint];
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const key = getKey(identifier, endpoint);
    
    let record = rateLimits.get(key);
    
    if (!record) {
      record = {
        count: 1,
        resetAt: Date.now() + limit.window
      };
      rateLimits.set(key, record);
      return next();
    }
    
    const now = Date.now();
    
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + limit.window;
      return next();
    }
    
    record.count += 1;
    
    if (record.count > limit.max) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetAt - now) / 1000)
      });
    }
    
    next();
  };
}
