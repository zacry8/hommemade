/**
 * Vercel AI SDK + OpenRouter Implementation 
 * Handles chat requests for Homme Made AI assistants using Vercel's recommended AI SDK
 */

import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export default async function handler(req, res) {
  console.log('🚀 AI SDK endpoint called - Method:', req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
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

    // Check API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY not found in environment');
      res.status(500).json({ error: 'Service configuration error' });
      return;
    }

    console.log('🔑 OpenRouter API key found, length:', process.env.OPENROUTER_API_KEY.length);
    console.log('📨 Processing request for bot:', botType);
    console.log('📨 Message count:', messages.length);

    // Use Vercel AI SDK with OpenRouter
    console.log('🔄 Calling AI SDK with OpenRouter...');
    const startTime = Date.now();
    
    const { text } = await generateText({
      model: openrouter('qwen/qwen3-235b-a22b-07-25:free'),
      messages: messages,
      maxTokens: 1500,
      temperature: 0.65,
      topP: 0.85,
    });

    const executionTime = Date.now() - startTime;
    console.log('✅ AI SDK response generated successfully in', executionTime, 'ms');
    console.log('📝 Response preview:', text.substring(0, 100) + '...');

    // Track usage (optional)
    console.log(`AI SDK request - Bot: ${botType}, Messages: ${messages.length}, Time: ${executionTime}ms`);

    res.status(200).json({ 
      message: text,
      botType: botType,
      timestamp: new Date().toISOString(),
      provider: 'vercel-ai-sdk',
      executionTime: executionTime
    });

  } catch (error) {
    console.error('❌ AI SDK error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific OpenRouter errors
    if (error.message?.includes('401')) {
      console.error('❌ OpenRouter API key authentication failed');
      res.status(500).json({ 
        error: 'API authentication failed. Please check configuration.',
        code: 'AUTH_ERROR'
      });
    } else if (error.message?.includes('rate limit')) {
      console.error('❌ OpenRouter rate limit exceeded');
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a moment.',
        code: 'RATE_LIMIT'
      });
    } else {
      // Generic error handling
      res.status(500).json({ 
        error: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        code: 'AI_SDK_ERROR',
        details: error.message
      });
    }
  }
}