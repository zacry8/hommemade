/**
 * Debug Submit API - Simple Test
 * 
 * Minimal version to test what's causing the JSON parse error
 */

export default async function handler(req, res) {
  try {
    console.log('🔍 Debug submit - method:', req.method);
    console.log('🔍 Debug submit - headers:', req.headers);
    console.log('🔍 Debug submit - body type:', typeof req.body);
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      });
    }

    // Test environment variables
    const envCheck = {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      hasResendKey: !!process.env.RESEND_API_KEY,
      debug: process.env.DEBUG,
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('🔍 Environment check:', envCheck);

    // Return basic success
    return res.status(200).json({
      success: true,
      message: 'Debug submit working',
      timestamp: new Date().toISOString(),
      envCheck
    });

  } catch (error) {
    console.error('❌ Debug submit error:', error);
    
    return res.status(500).json({ 
      error: 'Debug submit failed',
      message: error.message,
      stack: error.stack
    });
  }
}