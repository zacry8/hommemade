/**
 * Admin API Route - List All Submissions
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - Admin authentication required
 * - "Functional Over Flash" - Simple data retrieval
 * - "Your Data" - Direct blob access, no third parties
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

    console.log('📋 Loading submissions:', { count: blobs.length });

    const submissions = [];
    
    // Fetch and parse each submission
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        if (!response.ok) {
          console.error('❌ Failed to fetch blob:', blob.pathname);
          continue;
        }
        
        const text = await response.text();
        const submission = JSON.parse(text);
        
        // Add blob metadata
        submission.blobUrl = blob.url;
        submission.blobSize = blob.size;
        submission.blobUploadedAt = blob.uploadedAt;
        
        submissions.push(submission);
      } catch (error) {
        console.error('❌ Error parsing submission:', blob.pathname, error);
        // Continue with other submissions
      }
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log('✅ Submissions loaded:', { 
      total: submissions.length,
      newest: submissions[0]?.timestamp || 'none'
    });

    res.status(200).json(submissions);

  } catch (error) {
    console.error('❌ Admin submissions error:', error);
    
    res.status(500).json({ 
      error: 'Failed to load submissions',
      message: 'An error occurred while loading submissions'
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