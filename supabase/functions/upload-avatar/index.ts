//@ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const clerkApiKey = Deno.env.get('CLERK_API_KEY');
if (!supabaseUrl || !supabaseServiceRoleKey || !clerkApiKey) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or CLERK_API_KEY in environment');
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
serve(async (req)=>{
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  // Get Clerk JWT from Authorization header
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return new Response(JSON.stringify({
      error: 'Missing Authorization token'
    }), {
      status: 401
    });
  }
  // Verify Clerk JWT via Clerk API
  let clerkUserId = '';
  try {
    const verifyRes = await fetch('https://api.clerk.dev/v1/tokens/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token
      })
    });
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson.sub) {
      throw new Error(verifyJson.message || 'Clerk token verification failed');
    }
    clerkUserId = verifyJson.sub;
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Invalid Clerk token: ' + (err.message || err)
    }), {
      status: 401
    });
  }
  // Parse multipart/form-data
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return new Response(JSON.stringify({
      error: 'Content-Type must be multipart/form-data'
    }), {
      status: 400
    });
  }
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({
      error: 'Missing file field'
    }), {
      status: 400
    });
  }
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const filepath = `users/${clerkUserId}/avatar_images/${filename}`;
  // Upload to Supabase Storage
  const { error } = await supabase.storage.from('Users').upload(filepath, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) {
    return new Response(JSON.stringify({
      error: 'Supabase upload failed: ' + error.message
    }), {
      status: 500
    });
  }
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('Users').getPublicUrl(filepath);
  if (!publicUrlData?.publicUrl) {
    return new Response(JSON.stringify({
      error: 'Could not generate public URL'
    }), {
      status: 500
    });
  }
  return new Response(JSON.stringify({
    publicUrl: publicUrlData.publicUrl
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});
