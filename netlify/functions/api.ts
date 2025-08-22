// NOTE: Using a single Netlify function handler that routes /api/* paths.
// We've removed the serverless-http export to avoid duplicate handler exports.
import type { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertUserProfileSchema } from '../../shared/schema';
import { aiService } from '../../server/ai-service-replicate';

// Helper to build JSON responses
function json(statusCode: number, data: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}

function methodNotAllowed(method: string) {
  return json(405, { message: `Method ${method} Not Allowed` });
}

export const handler: Handler = async (event) => {
  try {
    // Derive subpath from the function URL so we can route inside this single function
    const url = new URL(event.rawUrl);
    const fnPrefix = '/.netlify/functions/api';
    let pathname = url.pathname;
    // Support both function URL and original /api/* URL in dev/prod
    if (pathname.startsWith(fnPrefix)) {
      pathname = pathname.slice(fnPrefix.length);
    }
    // If we still have /api/*, strip the /api prefix
    if (pathname === '/api') pathname = '/';
    else if (pathname.startsWith('/api/')) pathname = pathname.slice(4);
    // Normalize: remove trailing slash (except root)
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

    const method = event.httpMethod.toUpperCase();
  // Debug minimal log (safe for CF envs)
  try { console.log(`[fn api] ${method} ${pathname}`); } catch {}

    // Basic CORS preflight support if needed
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: '',
      };
    }

    // Route: /api/profile (GET, POST)
  if (pathname === '/profile') {
      if (method === 'GET') {
        const userId = 'demo-user';
        const profile = await storage.getUserProfile(userId);
        if (!profile) return json(200, null); // client expects null when not found
        return json(200, profile);
      }

      if (method === 'POST') {
        const userId = 'demo-user';
        const body = event.body ? JSON.parse(event.body) : {};
        try {
          const validated = insertUserProfileSchema.parse(body);
          const existing = await storage.getUserProfile(userId);
          const profile = existing
            ? await storage.updateUserProfile(userId, validated)
            : await storage.createUserProfile(userId, validated);
          return json(200, profile);
        } catch (err) {
          console.error('Profile creation/update error:', err);
          return json(400, { message: 'Invalid profile data' });
        }
      }

      return methodNotAllowed(method);
    }

    // Route: /api/profile/completion (PATCH)
  if (pathname === '/profile/completion') {
      if (method === 'PATCH') {
        const userId = 'demo-user';
        const body = event.body ? JSON.parse(event.body) : {};
        const completed = body.completed;
        if (!completed || typeof completed !== 'object') {
          return json(400, { message: 'Invalid completion data' });
        }
        const profile = await storage.updateUserProfile(userId, { completed });
        if (!profile) return json(404, { message: 'Profile not found' });
        return json(200, profile);
      }
      return methodNotAllowed(method);
    }

    // Route: /api/generate-plans (POST)
  if (pathname === '/generate-plans') {
      if (method === 'POST') {
        try {
          const userId = 'demo-user';
          const body = event.body ? JSON.parse(event.body) : {};
          const profile = body.profile || (await storage.getUserProfile(userId));
          if (!profile) return json(400, { message: 'Profile is required' });

          const [workoutPlan, nutritionPlan, sleepPlan] = await Promise.all([
            aiService.generateWorkoutPlan(profile),
            aiService.generateNutritionPlan(profile),
            aiService.generateSleepPlan(profile),
          ]);

          return json(200, { workoutPlan, nutritionPlan, sleepPlan });
        } catch (error) {
          console.error('AI plan generation error:', error);
          return json(500, { message: 'Failed to generate AI plans' });
        }
      }
      return methodNotAllowed(method);
    }

    // Route: /api/generate-schedule (POST)
  if (pathname === '/generate-schedule') {
      if (method === 'POST') {
        try {
          const userId = 'demo-user';
          const body = event.body ? JSON.parse(event.body) : {};
          const profile = body.profile || (await storage.getUserProfile(userId));
          if (!profile) return json(400, { message: 'Profile is required' });

          const schedule = await aiService.generateWeeklySchedule(profile);
          return json(200, { schedule });
        } catch (error) {
          console.error('AI schedule generation error:', error);
          return json(500, { message: 'Failed to generate AI schedule' });
        }
      }
      return methodNotAllowed(method);
    }

    // Route: /api/chat (POST)
  if (pathname === '/chat') {
      if (method === 'POST') {
        try {
          const body = event.body ? JSON.parse(event.body) : {};
          const message = body.message;
          if (!message || typeof message !== 'string') {
            return json(400, { message: 'Message is required' });
          }

          const userId = 'demo-user';
          const profile = body.profile || (await storage.getUserProfile(userId));
          const response = await aiService.generateChatResponse(message, profile || undefined);
          return json(200, { response });
        } catch (error) {
          console.error('AI chat error:', error);
          return json(500, { message: 'Failed to get AI response' });
        }
      }
      return methodNotAllowed(method);
    }

    // Not found
    return json(404, { message: 'Not Found' });
  } catch (error) {
    console.error('Unhandled function error:', error);
    return json(500, { message: 'Internal Server Error' });
  }
};
