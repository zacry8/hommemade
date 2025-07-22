/**
 * Vercel Serverless Function for AI Chatbot
 * Handles chat requests for Homme Made AI assistants
 */

export default async function handler(req, res) {
  console.log('🚀 Chat API called - Method:', req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('📨 Request body:', req.body);
    const { messages, botType } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    if (!botType) {
      res.status(400).json({ error: 'Bot type is required' });
      return;
    }

    // Get API configuration - OpenRouter primary with Qwen3 235B
    const apiKey = process.env.OPENROUTER_API_KEY;
    const fallbackApiKey = process.env.GROQ_API_KEY;

    console.log('🔑 API Key status:', {
      openrouter: apiKey ? '✅ Available' : '❌ Missing',
      groq: fallbackApiKey ? '✅ Available' : '❌ Missing'
    });

    if (!apiKey && !fallbackApiKey) {
      console.error('❌ No API keys configured');
      res.status(500).json({ error: 'Service temporarily unavailable' });
      return;
    }

    // Try OpenRouter first (Qwen3 235B - highest quality)
    let response;
    try {
      console.log('🔄 Trying OpenRouter API...');
      response = await callOpenRouterAPI(messages, apiKey);
      console.log('✅ OpenRouter API success');
    } catch (openrouterError) {
      console.log('❌ OpenRouter API failed:', openrouterError.message);
      
      // Fallback to Groq if available
      if (fallbackApiKey) {
        console.log('🔄 Trying Groq fallback...');
        response = await callGroqAPI(messages, fallbackApiKey);
        console.log('✅ Groq fallback success');
      } else {
        console.log('❌ No fallback available');
        throw openrouterError;
      }
    }

    // Track usage (optional)
    console.log(`Chat request - Bot: ${botType}, Messages: ${messages.length}`);

    res.status(200).json({ 
      message: response,
      botType: botType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Call Groq API with Llama 3 model (Fallback Provider)
 */
async function callGroqAPI(messages, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192', // Fast and reliable model
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I apologize, but I received an empty response. Please try rephrasing your question.';
}

/**
 * Call OpenRouter API with Qwen3 235B (Primary Provider)
 */
async function callOpenRouterAPI(messages, apiKey) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL || 'https://hommemade.vercel.app',
      'X-Title': 'Homme Made AI Assistants'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-235b-a22b-07-25:free', // Qwen3 235B - Advanced free model
      messages: messages,
      max_tokens: 1500, // Increased for Qwen3's superior capabilities
      temperature: 0.65, // Optimized for balanced creativity/accuracy
      top_p: 0.85 // Good balance for quality responses
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I apologize, but I received an empty response. Please try rephrasing your question.';
}

/**
 * Rate limiting helper (basic implementation)
 */
function getRateLimitKey(req) {
  // Use IP address or user identifier
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
}

// Simple in-memory rate limiting (for basic protection)
const rateLimitStore = new Map();

function checkRateLimit(key, maxRequests = 20, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);
  
  return true; // Request allowed
}