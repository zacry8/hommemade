/**
 * Rate Limiting Middleware
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - Prevents spam and abuse
 * - "Functional Over Flash" - Simple in-memory rate limiting
 * - "Free to Run & Operate" - No external rate limiting services
 */

// In-memory store for rate limiting
const attempts = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 submissions per window
  cleanupIntervalMs: 60 * 1000, // Clean up old entries every minute
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of attempts.entries()) {
    if (now > data.resetTime) {
      attempts.delete(ip);
    }
  }
}, RATE_LIMIT_CONFIG.cleanupIntervalMs);

/**
 * Rate limiting middleware
 */
export function rateLimit(req, res, next) {
  const ip = getClientIP(req);
  const now = Date.now();
  
  // Get or create rate limit data for this IP
  let rateLimitData = attempts.get(ip);
  
  if (!rateLimitData) {
    // First request from this IP
    rateLimitData = {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      firstAttempt: now
    };
    attempts.set(ip, rateLimitData);
  } else {
    // Check if window has expired
    if (now > rateLimitData.resetTime) {
      // Reset the counter
      rateLimitData.count = 1;
      rateLimitData.resetTime = now + RATE_LIMIT_CONFIG.windowMs;
      rateLimitData.firstAttempt = now;
    } else {
      // Increment counter
      rateLimitData.count += 1;
    }
  }
  
  // Check if rate limit exceeded
  if (rateLimitData.count > RATE_LIMIT_CONFIG.maxAttempts) {
    const resetTimeSeconds = Math.ceil((rateLimitData.resetTime - now) / 1000);
    
    console.warn('🚫 Rate limit exceeded:', {
      ip,
      count: rateLimitData.count,
      resetInSeconds: resetTimeSeconds
    });
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxAttempts);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000));
    res.setHeader('Retry-After', resetTimeSeconds);
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many form submissions. Please try again in ${resetTimeSeconds} seconds.`,
      retryAfter: resetTimeSeconds
    });
  }
  
  // Set rate limit headers for successful requests
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxAttempts);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - rateLimitData.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000));
  
  // Log rate limit info (only in debug mode)
  if (process.env.DEBUG === 'true') {
    console.log('📊 Rate limit info:', {
      ip,
      count: rateLimitData.count,
      limit: RATE_LIMIT_CONFIG.maxAttempts,
      remaining: RATE_LIMIT_CONFIG.maxAttempts - rateLimitData.count,
      resetTime: new Date(rateLimitData.resetTime).toISOString()
    });
  }
  
  next();
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  // Check various headers for the real IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  const xClientIP = req.headers['x-client-ip'];
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  if (xClientIP) return xClientIP;
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.connection?.socket?.remoteAddress ||
         'unknown';
}

/**
 * Get current rate limit status for an IP
 */
export function getRateLimitStatus(ip) {
  const rateLimitData = attempts.get(ip);
  if (!rateLimitData) {
    return {
      count: 0,
      remaining: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null
    };
  }
  
  const now = Date.now();
  if (now > rateLimitData.resetTime) {
    return {
      count: 0,
      remaining: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null
    };
  }
  
  return {
    count: rateLimitData.count,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - rateLimitData.count),
    resetTime: rateLimitData.resetTime
  };
}

/**
 * Clear rate limit for an IP (for testing/admin purposes)
 */
export function clearRateLimit(ip) {
  attempts.delete(ip);
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const now = Date.now();
  let activeIPs = 0;
  let totalAttempts = 0;
  let blockedIPs = 0;
  
  for (const [ip, data] of attempts.entries()) {
    if (now <= data.resetTime) {
      activeIPs++;
      totalAttempts += data.count;
      if (data.count > RATE_LIMIT_CONFIG.maxAttempts) {
        blockedIPs++;
      }
    }
  }
  
  return {
    activeIPs,
    totalAttempts,
    blockedIPs,
    config: RATE_LIMIT_CONFIG
  };
}