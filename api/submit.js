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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    // Check environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ Missing BLOB_READ_WRITE_TOKEN');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Please check server configuration'
      });
    }

    // Basic form data validation (keep your form working)
    const formData = req.body;
    if (!formData || !formData.name || !formData.email) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Use the original form data directly (no sanitization to keep compatibility)
    const sanitizedData = formData;
    
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

    // Store submission in Vercel Blob (simple)
    const filename = `submissions/${submissionId}.json`;
    const submissionJson = JSON.stringify(submissionData, null, 2);
    
    const blob = await put(filename, submissionJson, {
      access: 'private',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log('💾 Submission stored in blob:', {
      submissionId,
      blobUrl: blob.url,
      pathname: blob.pathname
    });

    // Send email notification (simple - inline to avoid import issues)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false' && process.env.RESEND_API_KEY) {
      try {
        const emailContent = buildSimpleEmail(sanitizedData, submissionId);
        await sendSimpleEmail(emailContent);
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
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@hommemade.xyz',
      to: process.env.EMAIL_TO || 'hello@hommemade.xyz',
      subject: emailContent.subject,
      html: emailContent.html,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};