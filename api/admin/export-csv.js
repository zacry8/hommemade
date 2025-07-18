/**
 * Admin API Route - Export Submissions as CSV
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - Admin authentication required
 * - "Functional Over Flash" - Clean CSV export
 * - "Your Data" - Direct export of your submissions
 */

import { list } from '@vercel/blob';
import { isAuthorized, getAuthChallenge } from '../../lib/auth.js';
import { config } from '../../lib/config.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are accepted'
    });
  }

  // Check authentication
  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', getAuthChallenge());
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Admin authentication required'
    });
  }

  try {
    // List all submission files from Vercel Blob
    const { blobs } = await list({ 
      prefix: 'submissions/',
      token: config.BLOB_READ_WRITE_TOKEN
    });

    const submissions = [];
    
    // Fetch and parse each submission
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        if (!response.ok) continue;
        
        const text = await response.text();
        const submission = JSON.parse(text);
        submissions.push(submission);
      } catch (error) {
        console.error('❌ Error parsing submission for CSV:', blob.pathname, error);
        // Continue with other submissions
      }
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Generate CSV content
    const csvContent = generateCSV(submissions);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="submissions-${new Date().toISOString().split('T')[0]}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('📥 CSV export generated:', { 
      submissions: submissions.length,
      size: csvContent.length
    });

    res.status(200).send(csvContent);

  } catch (error) {
    console.error('❌ CSV export error:', error);
    
    res.status(500).json({ 
      error: 'Failed to export CSV',
      message: 'An error occurred while generating the CSV export'
    });
  }
}

function generateCSV(submissions) {
  // Define CSV headers
  const headers = [
    'Submission ID',
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Brand Name',
    'Industry',
    'Online Presence',
    'Why Now',
    'Success Metrics',
    'Struggles',
    'Other Struggle',
    'Brand Voice',
    'Brand Tone',
    'Avoidances',
    'Aesthetic References',
    'Offering',
    'Value Provision',
    'Dream Audience',
    'Feedback',
    'Communication Preference',
    'Additional Info',
    'Files Count',
    'File Names'
  ];

  // Create CSV rows
  const rows = submissions.map(submission => {
    const fileNames = submission.files && submission.files.length > 0
      ? submission.files.map(f => f.fileName).join('; ')
      : '';

    return [
      submission.id || '',
      submission.timestamp || '',
      submission.name || '',
      submission.email || '',
      submission.phone || '',
      submission.brandName || '',
      submission.industry || '',
      submission.onlinePresence || '',
      submission.whyNow || '',
      submission.successMetrics || '',
      submission.struggles ? submission.struggles.join(', ') : '',
      submission.otherStruggle || '',
      submission.brandVoice || '',
      submission.brandTone || '',
      submission.avoidances || '',
      submission.aestheticReferences || '',
      submission.offering || '',
      submission.valueProvision || '',
      submission.dreamAudience || '',
      submission.feedback || '',
      submission.communication || '',
      submission.additionalInfo || '',
      submission.files ? submission.files.length : 0,
      fileNames
    ];
  });

  // Combine headers and rows
  const allRows = [headers, ...rows];

  // Convert to CSV format
  return allRows.map(row => 
    row.map(field => {
      // Escape quotes and wrap in quotes if needed
      const stringField = String(field);
      if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return '"' + stringField.replace(/"/g, '""') + '"';
      }
      return stringField;
    }).join(',')
  ).join('\n');
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};