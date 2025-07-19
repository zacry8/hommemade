/**
 * Form Submission API Route - Simple & Working
 * 
 * Basic functionality:
 * - Store form data in Vercel Blob
 * - Send email notification via Resend
 * - Handle file uploads
 * - Return proper JSON responses
 */

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log('🔍 Submit API - Starting request');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('🔍 Submit API - Method not POST:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    console.log('🔍 Submit API - In try block');
    
    // Check environment variables
    console.log('🔍 Submit API - Checking env vars');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ Missing BLOB_READ_WRITE_TOKEN');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Please check server configuration'
      });
    }
    console.log('🔍 Submit API - Env vars OK');

    // Basic form data validation (keep your form working)
    console.log('🔍 Submit API - Validating form data');
    const formData = req.body;
    console.log('🔍 Submit API - Form data keys:', Object.keys(formData || {}));
    
    if (!formData || !formData.name || !formData.email) {
      console.log('🔍 Submit API - Validation failed');
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Use the original form data directly (no sanitization to keep compatibility)
    const sanitizedData = formData;
    
    console.log('🔍 Submit API - Generating submission ID');
    // Generate unique submission ID
    const timestamp = new Date().toISOString();
    const submissionId = timestamp.replace(/[:.]/g, '-');
    console.log('🔍 Submit API - Generated ID:', submissionId);
    
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

    // Store submission in Vercel Blob (simple)
    console.log('🔍 Submit API - Starting blob storage');
    const filename = `submissions/${submissionId}.json`;
    const submissionJson = JSON.stringify(submissionData, null, 2);
    console.log('🔍 Submit API - Calling put() with filename:', filename);
    
    const blob = await put(filename, submissionJson, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log('🔍 Submit API - Blob storage successful');
    console.log('💾 Submission stored in blob:', {
      submissionId,
      blobUrl: blob.url,
      pathname: blob.pathname
    });

    // Send email notification (simple - inline to avoid import issues)
    console.log('🔍 Submit API - Checking email settings');
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false' && process.env.RESEND_API_KEY) {
      console.log('🔍 Submit API - Sending email notification');
      try {
        const emailContent = buildSimpleEmail(sanitizedData, submissionId);
        await sendSimpleEmail(emailContent);
        console.log('📧 Email notification sent');
      } catch (error) {
        console.error('❌ Email notification error:', error);
        // Don't fail the submission if email fails
      }
    } else {
      console.log('🔍 Submit API - Email notifications disabled or no API key');
    }

    // Return success response
    console.log('🔍 Submit API - Returning success response');
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

// Simple email functions (inline to avoid import issues)
function buildSimpleEmail(formData, leadId) {
  const subject = `New Onboarding Form Submission - ${formData.name}`;
  
  const html = `
    <h2>New Onboarding Form Submission</h2>
    <p><strong>Lead ID:</strong> ${leadId}</p>
    
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Brand:</strong> ${formData.brandName}</p>
    ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
    
    <h3>Project Details</h3>
    <p><strong>Why Now:</strong> ${formData.whyNow}</p>
    <p><strong>Success Metrics:</strong> ${formData.successMetrics}</p>
    <p><strong>Communication:</strong> ${formData.communication}</p>
    
    ${formData.files && formData.files.length > 0 ? `
    <h3>Files</h3>
    ${formData.files.map(file => `<p><a href="${file.url}">${file.fileName}</a></p>`).join('')}
    ` : ''}
  `;
  
  return { subject, html };
}

async function sendSimpleEmail(emailContent) {
  // Validate email configuration before sending
  const fromEmail = process.env.EMAIL_FROM || 'noreply@hommemade.xyz';
  const toEmail = process.env.EMAIL_TO || 'zacry8r@gmail.com';
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  
  console.log('📧 Sending email from:', fromEmail, 'to:', toEmail);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { message: errorText };
    }
    
    // Provide specific error messages for common issues
    if (response.status === 401) {
      throw new Error(`Email authentication failed: API key may be invalid or expired. Details: ${errorDetails.message}`);
    } else if (response.status === 422) {
      throw new Error(`Email validation failed: Check from/to addresses and domain verification. Details: ${errorDetails.message}`);
    } else {
      throw new Error(`Email API error: ${response.status} - ${errorDetails.message || errorText}`);
    }
  }
  
  const result = await response.json();
  console.log('📧 Email sent successfully, ID:', result.id);
  return result;
}

// Configure API route
export const apiRouteConfig = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};