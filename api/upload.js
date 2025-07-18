/**
 * File Upload API Route - Vercel Blob integration
 * 
 * Follows mind-bank principles:
 * - "Secure & Private" - Private file storage with access controls
 * - "Free to Run & Operate" - Uses Vercel's native blob storage
 * - "No dark patterns" - Transparent file handling
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

    // Check if file upload is enabled
    const fileConfig = getFileUploadConfig();
    if (!fileConfig.enabled) {
      return res.status(403).json({ 
        error: 'File upload disabled',
        message: 'File upload functionality is currently disabled'
      });
    }

    // Get the file from the request
    const { file, fileName } = req.body;
    
    if (!file || !fileName) {
      return res.status(400).json({ 
        error: 'Missing file data',
        message: 'Both file and fileName are required'
      });
    }

    // Validate file type
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    if (!fileExtension || !fileConfig.allowedTypes.includes(fileExtension)) {
      return res.status(400).json({ 
        error: 'File type not allowed',
        message: `Allowed file types: ${fileConfig.allowedTypes.join(', ')}`,
        allowedTypes: fileConfig.allowedTypes
      });
    }

    // Validate file size (if we can determine it)
    if (file.length && file.length > fileConfig.maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        message: `Maximum file size: ${Math.round(fileConfig.maxSize / 1024 / 1024)}MB`,
        maxSize: fileConfig.maxSize
      });
    }

    // Generate unique filename linked to submission
    const timestamp = Date.now();
    const submissionId = req.body.submissionId || timestamp.toString();
    const uniqueFileName = `uploads/${submissionId}-${fileName}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: 'private', // Private access for user privacy
      addRandomSuffix: false, // Use our own naming scheme
      token: config.BLOB_READ_WRITE_TOKEN,
      cacheControlMaxAge: 3600, // 1 hour browser cache
      multipart: true // For reliability with larger files
    });

    // Log successful upload (without sensitive data)
    console.log('📁 File uploaded successfully:', {
      submissionId,
      originalName: fileName,
      blobUrl: blob.url,
      pathname: blob.pathname,
      timestamp: new Date().toISOString()
    });

    // Return success response
    res.status(200).json({
      success: true,
      file: {
        url: blob.url,
        fileName: fileName,
        uniqueFileName: uniqueFileName,
        pathname: blob.pathname,
        uploadedAt: new Date().toISOString()
      }
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

// Configure API route for larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};