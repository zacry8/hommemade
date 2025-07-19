/**
 * File Upload API Route - Vercel Official Pattern
 * 
 * Simple file upload using Vercel's recommended approach:
 * - Direct file-to-blob upload
 * - Query parameter for filename
 * - Private access for security
 * - Minimal validation
 */

import { put } from '@vercel/blob';
import { config, getFileUploadConfig, validateConfig } from '../lib/config.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    // Validate configuration
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      console.error('❌ Configuration errors:', configErrors);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Please check server configuration'
      });
    }

    // Get filename from query parameters (Vercel pattern)
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return res.status(400).json({ 
        error: 'Missing filename',
        message: 'Filename must be provided as query parameter'
      });
    }

    // Check if file upload is enabled
    const fileConfig = getFileUploadConfig();
    if (!fileConfig.enabled) {
      return res.status(403).json({ 
        error: 'File upload disabled',
        message: 'File upload functionality is currently disabled'
      });
    }

    // Validate file type
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    if (!fileExtension || !fileConfig.allowedTypes.includes(fileExtension)) {
      return res.status(400).json({ 
        error: 'File type not allowed',
        message: `Allowed file types: ${fileConfig.allowedTypes.join(', ')}`,
        allowedTypes: fileConfig.allowedTypes
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `uploads/${timestamp}-${filename}`;

    // Upload to Vercel Blob using official pattern (Pages API version)
    const blob = await put(uniqueFileName, req, {
      access: 'private',
      addRandomSuffix: false,
      token: config.BLOB_READ_WRITE_TOKEN
    });

    // Log successful upload
    console.log('📁 File uploaded successfully:', {
      originalName: filename,
      uniqueName: uniqueFileName,
      blobUrl: blob.url,
      pathname: blob.pathname,
      timestamp: new Date().toISOString()
    });

    // Return success response (Vercel blob format)
    res.status(200).json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      downloadUrl: blob.downloadUrl
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      error: 'Upload failed',
      message: 'An error occurred while uploading the file. Please try again.'
    });
  }
}

// Configure API route for file uploads (disable bodyParser for raw file handling)
export const config = {
  api: {
    bodyParser: false,
  },
};