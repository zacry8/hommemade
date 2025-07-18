/**
 * Authentication Middleware - Basic Auth for Admin Dashboard
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - Simple, effective authentication
 * - "Functional Over Flash" - No complex OAuth, just basic auth
 * - "Free to Run & Operate" - No external auth services
 */

import { getAdminConfig } from './config.js';

/**
 * Check if the request has valid admin authentication
 */
export function isAuthorized(req) {
  const auth = req.headers.authorization;
  const adminConfig = getAdminConfig();
  
  // Allow access if no admin credentials are configured (development)
  if (!adminConfig.username || !adminConfig.password) {
    console.warn('⚠️  Admin authentication not configured - allowing access');
    return true;
  }
  
  if (!auth || !auth.startsWith('Basic ')) {
    return false;
  }
  
  try {
    const encoded = auth.slice(6); // Remove 'Basic ' prefix
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [username, password] = decoded.split(':');
    
    return username === adminConfig.username && password === adminConfig.password;
  } catch (error) {
    console.error('❌ Auth error:', error);
    return false;
  }
}

/**
 * Middleware to protect admin routes
 */
export function requireAuth(req, res, next) {
  if (!isAuthorized(req)) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Admin authentication required'
    });
    return;
  }
  
  next();
}

/**
 * Generate WWW-Authenticate header for 401 responses
 */
export function getAuthChallenge() {
  return 'Basic realm="Admin Dashboard"';
}