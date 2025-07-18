/**
 * Form Submission API Route - Simplified Vercel Blob Storage
 * 
 * Follows mind-bank principles:
 * - "Functional Over Flash" - Direct blob storage, no complexity
 * - "Secure & Private" - Your data stays in your Vercel account
 * - "Free to Run & Operate" - Uses Vercel's generous free tier
 * - "Community-Aligned" - User-focused experience
 */

import { put } from '@vercel/blob';
import { config, validateConfig, getConfigSummary } from '../lib/config.js';
import { validateFormData, sanitizeFormData } from '../lib/validation.js';
import { rateLimit } from '../lib/rateLimit.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  // Apply rate limiting
  try {
    await new Promise((resolve, reject) => {
      rateLimit(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    // Rate limit error response is already sent by the middleware
    return;
  }

  try {
    // Log configuration summary (without secrets)
    if (config.DEBUG) {
      console.log('🔧 Configuration summary:', getConfigSummary());
    }

    // Validate server configuration
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      console.error('❌ Configuration errors:', configErrors);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Please check server configuration'
      });
    }

    // Validate form data
    const validation = validateFormData(req.body);
    if (!validation.isValid) {
      console.log('❌ Form validation errors:', validation.errors);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Please check your form data',
        errors: validation.errors
      });
    }

    // Sanitize form data
    const sanitizedData = sanitizeFormData(req.body);
    
    // Generate unique submission ID
    const timestamp = new Date().toISOString();
    const submissionId = timestamp.replace(/[:.]/g, '-');
    
    // Log form submission (without sensitive data)
    console.log('📋 Form submission received:', {
      submissionId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      brandName: sanitizedData.brandName,
      hasFiles: !!(sanitizedData.files && sanitizedData.files.length > 0),
      timestamp
    });

    // Prepare submission data
    const submissionData = {
      id: submissionId,
      timestamp,
      ...sanitizedData
    };

    // Store submission in Vercel Blob
    const filename = `submissions/${submissionId}.json`;
    const blob = await put(filename, JSON.stringify(submissionData, null, 2), {
      access: 'private',
      addRandomSuffix: false
    });

    console.log('💾 Submission stored in blob:', {
      submissionId,
      blobUrl: blob.url,
      size: blob.size
    });

    // Send email notification if enabled
    if (config.ENABLE_EMAIL_NOTIFICATIONS) {
      try {
        const { sendNotification } = await import('../lib/email.js');
        await sendNotification(sanitizedData, submissionId);
        console.log('📧 Email notification sent');
      } catch (error) {
        console.error('❌ Email notification error:', error);
        // Don't fail the submission if email fails
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submissionId,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('❌ Form submission error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      error: 'Submission failed',
      message: 'An error occurred while processing your submission. Please try again.'
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};