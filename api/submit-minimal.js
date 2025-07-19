/**
 * Ultra-Minimal Submit API - Test Basic Function
 * 
 * Just validates and returns success to test if basic API works
 */

export default async function handler(req, res) {
  console.log('🔍 Minimal submit - starting');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('🔍 Minimal submit - method not allowed');
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    console.log('🔍 Minimal submit - in try block');
    
    // Basic form data validation
    const formData = req.body;
    console.log('🔍 Minimal submit - form data received:', {
      hasName: !!formData?.name,
      hasEmail: !!formData?.email,
      hasBrandName: !!formData?.brandName
    });
    
    if (!formData || !formData.name || !formData.email) {
      console.log('🔍 Minimal submit - validation failed');
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Generate submission ID
    const timestamp = new Date().toISOString();
    const submissionId = timestamp.replace(/[:.]/g, '-');
    
    console.log('🔍 Minimal submit - generated ID:', submissionId);

    // Return success without storing anything
    console.log('🔍 Minimal submit - returning success');
    return res.status(200).json({
      success: true,
      message: 'Minimal submit test successful',
      submissionId: submissionId,
      timestamp: timestamp,
      receivedFields: Object.keys(formData)
    });

  } catch (error) {
    console.error('❌ Minimal submit error:', error);
    
    return res.status(500).json({ 
      error: 'Minimal submit failed',
      message: error.message,
      stack: process.env.DEBUG === 'true' ? error.stack : undefined
    });
  }
}