const ADMIN_USER_IDS = (Deno.env.get("ADMIN_USER_IDS") || "").split(",").filter(Boolean);

export function extractUserId(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

export function isAdmin(userId: string | null): boolean {
  if (!userId) return false;
  
  if (ADMIN_USER_IDS.length === 0) {
    return false;
  }
  
  return ADMIN_USER_IDS.includes(userId);
}

export function requireAdmin(req: Request): { userId: string; isAdmin: true } | Response {
  const authHeader = req.headers.get('authorization');
  const userId = extractUserId(authHeader);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!isAdmin(userId)) {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return { userId, isAdmin: true };
}
