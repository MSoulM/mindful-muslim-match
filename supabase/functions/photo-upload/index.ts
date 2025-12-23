import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const MAX_PHOTOS = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    // Handle different actions
    if (req.method === 'POST' && action === 'upload') {
      return await handleUpload(req, userId);
    } else if (req.method === 'DELETE') {
      const photoId = url.searchParams.get('id');
      if (!photoId) {
        return new Response(JSON.stringify({ error: 'Photo ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return await handleDelete(photoId, userId);
    } else if (req.method === 'PUT' && action === 'primary') {
      const photoId = url.searchParams.get('id');
      if (!photoId) {
        return new Response(JSON.stringify({ error: 'Photo ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return await handleSetPrimary(photoId, userId);
    } else if (req.method === 'PUT' && action === 'reorder') {
      const body = await req.json();
      return await handleReorder(body.photoIds, userId);
    } else if (req.method === 'GET') {
      return await handleList(userId);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Photo upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleUpload(req: Request, userId: string) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const isPrimary = formData.get('isPrimary') === 'true';

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File size exceeds 5MB limit' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check current photo count (excluding rejected)
  const { count, error: countError } = await supabase
    .from('profile_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('moderation_status', 'rejected');

  if (countError) {
    console.error('Count error:', countError);
    return new Response(JSON.stringify({ error: 'Failed to check photo count' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if ((count || 0) >= MAX_PHOTOS) {
    return new Response(JSON.stringify({ error: `Maximum ${MAX_PHOTOS} photos allowed` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Upload to storage
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `${userId}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(storagePath);

  // Simple AI moderation simulation (in production, use actual AI service)
  const moderationStatus = 'approved'; // Default to approved for now
  const approved = true;

  // If setting as primary, unset existing primary
  if (isPrimary) {
    await supabase
      .from('profile_photos')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
  }

  // Get next display order
  const { data: lastPhoto } = await supabase
    .from('profile_photos')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const displayOrder = (lastPhoto?.display_order || 0) + 1;

  // Insert photo record
  const { data: photo, error: insertError } = await supabase
    .from('profile_photos')
    .insert({
      user_id: userId,
      url: publicUrl,
      storage_path: storagePath,
      is_primary: isPrimary || (count === 0), // First photo is always primary
      approved,
      moderation_status: moderationStatus,
      display_order: displayOrder
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    // Clean up uploaded file
    await supabase.storage.from('profile-photos').remove([storagePath]);
    return new Response(JSON.stringify({ error: 'Failed to save photo record' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update profiles.primary_photo_url if this is the primary photo
  if (photo.is_primary && photo.approved) {
    await supabase
      .from('profiles')
      .update({ primary_photo_url: publicUrl })
      .eq('clerk_user_id', userId);
  }

  console.log(`Photo uploaded for user ${userId}: ${photo.id}`);

  return new Response(JSON.stringify({ 
    success: true, 
    photo: {
      id: photo.id,
      url: photo.url,
      isPrimary: photo.is_primary,
      approved: photo.approved,
      moderationStatus: photo.moderation_status
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDelete(photoId: string, userId: string) {
  // Get photo to delete
  const { data: photo, error: fetchError } = await supabase
    .from('profile_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !photo) {
    return new Response(JSON.stringify({ error: 'Photo not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Delete from storage
  await supabase.storage.from('profile-photos').remove([photo.storage_path]);

  // Delete record
  const { error: deleteError } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return new Response(JSON.stringify({ error: 'Failed to delete photo' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // If deleted photo was primary, set another approved photo as primary
  if (photo.is_primary) {
    const { data: nextPhoto } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', userId)
      .eq('approved', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single();

    if (nextPhoto) {
      await supabase
        .from('profile_photos')
        .update({ is_primary: true })
        .eq('id', nextPhoto.id);

      await supabase
        .from('profiles')
        .update({ primary_photo_url: nextPhoto.url })
        .eq('clerk_user_id', userId);
    } else {
      await supabase
        .from('profiles')
        .update({ primary_photo_url: null })
        .eq('clerk_user_id', userId);
    }
  }

  console.log(`Photo deleted for user ${userId}: ${photoId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSetPrimary(photoId: string, userId: string) {
  // Verify photo exists and belongs to user
  const { data: photo, error: fetchError } = await supabase
    .from('profile_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !photo) {
    return new Response(JSON.stringify({ error: 'Photo not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!photo.approved) {
    return new Response(JSON.stringify({ error: 'Cannot set unapproved photo as primary' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Unset existing primary
  await supabase
    .from('profile_photos')
    .update({ is_primary: false })
    .eq('user_id', userId)
    .eq('is_primary', true);

  // Set new primary
  const { error: updateError } = await supabase
    .from('profile_photos')
    .update({ is_primary: true })
    .eq('id', photoId);

  if (updateError) {
    console.error('Update error:', updateError);
    return new Response(JSON.stringify({ error: 'Failed to set primary photo' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update profiles.primary_photo_url
  await supabase
    .from('profiles')
    .update({ primary_photo_url: photo.url })
    .eq('clerk_user_id', userId);

  console.log(`Primary photo set for user ${userId}: ${photoId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleReorder(photoIds: string[], userId: string) {
  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid photo IDs' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update display order for each photo
  for (let i = 0; i < photoIds.length; i++) {
    await supabase
      .from('profile_photos')
      .update({ display_order: i + 1 })
      .eq('id', photoIds[i])
      .eq('user_id', userId);
  }

  console.log(`Photos reordered for user ${userId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleList(userId: string) {
  const { data: photos, error } = await supabase
    .from('profile_photos')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('List error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch photos' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    photos: photos.map(p => ({
      id: p.id,
      url: p.url,
      isPrimary: p.is_primary,
      approved: p.approved,
      moderationStatus: p.moderation_status,
      rejectionReason: p.rejection_reason,
      displayOrder: p.display_order
    }))
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
