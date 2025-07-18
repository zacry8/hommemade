/**
 * Configuration System - 2025 Streamlined Settings
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - No hardcoded secrets
 * - "No bait-and-switch" - Transparent configuration
 * - "Community-Aligned" - User-controlled settings
 * 
 * 2025 Updates:
 * - Resend-only email configuration
 * - Simplified validation logic
 * - Removed legacy SMTP complexity
 */

// Load environment variables from .env file
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export const config = {
  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  
  // Admin Authentication
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  
  // Email Configuration (2025 Resend-only)
  EMAIL_ENABLED: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
  EMAIL_FROM: process.env.EMAIL_FROM || 'hello@hommemade.xyz',
  EMAIL_TO: process.env.EMAIL_TO || 'hello@hommemade.xyz',
  EMAIL_SUBJECT: process.env.EMAIL_SUBJECT || 'New Onboarding Form Submission',
  
  // Resend API (primary email service)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  
  // File Upload Settings
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '52428800', // 50MB in bytes (match .env)
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,jpg,jpeg,png,gif,zip',
  
  // Security Settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '15', // minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '10', // requests per window
  
  // Development Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG === 'true',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS !== 'false',
  ENABLE_FILE_UPLOAD: process.env.ENABLE_FILE_UPLOAD !== 'false',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
};

/**
 * Get admin authentication configuration
 */
export function getAdminConfig() {
  return {
    username: config.ADMIN_USERNAME,
    password: config.ADMIN_PASSWORD,
  };
}

/**
 * Get email configuration object (2025 Resend-only)
 */
export function getEmailConfig() {
  return {
    enabled: config.EMAIL_ENABLED,
    from: config.EMAIL_FROM,
    to: config.EMAIL_TO,
    subject: config.EMAIL_SUBJECT,
    resend: {
      apiKey: config.RESEND_API_KEY,
    },
  };
}

/**
 * Get file upload configuration
 */
export function getFileUploadConfig() {
  return {
    maxSize: parseInt(config.MAX_FILE_SIZE),
    allowedTypes: config.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
    enabled: config.ENABLE_FILE_UPLOAD,
  };
}

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors = [];
  
  // Validate Vercel Blob (required for storing submissions)
  if (!config.BLOB_READ_WRITE_TOKEN) {
    errors.push('BLOB_READ_WRITE_TOKEN is required for storing submissions');
  }
  
  // Validate admin authentication (optional, but recommended)
  if (!config.ADMIN_USERNAME || !config.ADMIN_PASSWORD) {
    console.warn('⚠️  Admin authentication not configured - admin dashboard will be unprotected');
  }
  
  // Validate email configuration if enabled (2025 Resend-only)
  if (config.ENABLE_EMAIL_NOTIFICATIONS && config.EMAIL_ENABLED) {
    if (!config.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is required for email notifications in 2025');
    }
  }
  
  return errors;
}

/**
 * Get configuration summary for logging (without secrets)
 */
export function getConfigSummary() {
  return {
    emailEnabled: config.EMAIL_ENABLED,
    fileUploadEnabled: config.ENABLE_FILE_UPLOAD,
    analyticsEnabled: config.ENABLE_ANALYTICS,
    environment: config.NODE_ENV,
    debug: config.DEBUG,
    hasAdminAuth: !!(config.ADMIN_USERNAME && config.ADMIN_PASSWORD),
    hasEmailConfig: !!config.RESEND_API_KEY,
    hasBlobToken: !!config.BLOB_READ_WRITE_TOKEN,
  };
}