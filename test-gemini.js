// Simple test to check Gemini API configuration
import { GoogleGenAI } from '@google/genai';

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key available:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not set!');
  process.exit(1);
}

try {
  const ai = new GoogleGenAI({ apiKey });

  console.log('🔍 Testing Gemini API connection...');

  // Simple test request
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [{ parts: [{ text: 'Hello, can you respond with just "API working"?' }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('✅ Gemini API Response:', text);

  if (text && text.includes('working')) {
    console.log('🎉 Gemini API is working correctly!');
  } else {
    console.log('⚠️ Gemini API responded but unexpected response:', text);
  }
} catch (error) {
  console.error('❌ Gemini API Error:', error.message);

  if (error.message.includes('API_KEY')) {
    console.log('💡 This usually means:');
    console.log('   1. API key is invalid');
    console.log('   2. API key is not properly set in environment');
    console.log("   3. API key doesn't have Gemini API enabled");
  }
}
