// Shared CORS configuration for all edge functions
// Security: Restrict origins to known domains instead of wildcard

const allowedOrigins = [
  // Production domains (update with your actual domain)
  'https://avsuyudchzyoyakxotfm.lovable.app',
  // Lovable preview domains
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check if origin matches any allowed origin
  const isAllowed = allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    }
    // RegExp pattern matching
    return allowed.test(origin);
  });

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCorsPreFlight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
