/**
 * Simple Form Submission API - Bypass Complex Dependencies
 * 
 * Minimal working version to test form submission
 */

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    console.log('📋 Simple submit - received request');
    
    // Check environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ Missing BLOB_READ_WRITE_TOKEN');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Server configuration missing'
      });
    }

    // Basic form data validation
    const formData = req.body;
    if (!formData || !formData.name || !formData.email) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Generate submission ID
    const timestamp = new Date().toISOString();
    const submissionId = timestamp.replace(/[:.]/g, '-');
    
    console.log('📋 Processing submission:', {
      submissionId,
      name: formData.name,
      email: formData.email
    });

    // Store in Vercel Blob
    const submissionData = {
      id: submissionId,
      timestamp,
      ...formData
    };

    const filename = `submissions/${submissionId}.json`;
    const submissionJson = JSON.stringify(submissionData, null, 2);
    
    const blob = await put(filename, submissionJson, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log('💾 Submission stored:', blob.url);

    // Send basic success response
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submissionId,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('❌ Simple submit error:', error);
    
    return res.status(500).json({ 
      error: 'Submission failed',
      message: error.message,
      stack: process.env.DEBUG === 'true' ? error.stack : undefined
    });
  }
}