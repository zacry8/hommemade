/**
 * Environment Variables Debug Endpoint
 * 
 * Simple endpoint to verify critical environment variables
 * are properly loaded in production without exposing secrets
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are accepted'
    });
  }

  // Check environment variables without exposing values
  const envStatus = {
    BLOB_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    RESEND_KEY: !!process.env.RESEND_API_KEY,
    DEBUG: process.env.DEBUG,
    NODE_ENV: process.env.NODE_ENV,
    working: true,
    timestamp: new Date().toISOString()
  };

  // Log for debugging (server-side only)
  console.log('🔍 Environment check:', envStatus);

  res.status(200).json(envStatus);
}