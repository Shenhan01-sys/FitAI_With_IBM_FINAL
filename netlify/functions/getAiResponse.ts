import type { Handler } from '@netlify/functions';
import { aiService } from '../../server/ai-service-replicate';
import { storage } from '../../server/storage';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const message = body.message;
    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Message is required' }),
      };
    }

    const userId = 'demo-user';
    const profile = await storage.getUserProfile(userId);

    const response = await aiService.generateChatResponse(message, profile || undefined);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    };
  } catch (error) {
    console.error('AI function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
