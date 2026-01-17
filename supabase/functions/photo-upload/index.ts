import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { moderateImage } from "../_shared/moderation-service.ts";

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

interface ProfilePhoto {
  id: string;
  url: string;
  storagePath: string;
  isPrimary: boolean;
  approved: boolean;
  moderationStatus: string;
  rejectionReason?: string;
  moderationConfidence?: number;
  moderationFlags?: string[];
  moderatedAt?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  uploadedAt: string;
}

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

    // Extract user ID from JWT (Clerk token)
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
    const action = url.searchParams.get('action');

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

async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('photos, primary_photo_url')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }

  return data;
}

async function updateProfilePhotos(userId: string, photos: ProfilePhoto[], primaryPhotoUrl: string | null) {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      photos, 
      primary_photo_url: primaryPhotoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', userId);

  if (error) {
    console.error('Error updating profile photos:', error);
    throw new Error('Failed to update profile photos');
  }
}

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

  // Get current profile photos
  const profile = await getProfile(userId);
  const currentPhotos: ProfilePhoto[] = profile?.photos || [];
  
  // Count non-rejected photos
  const approvedCount = currentPhotos.filter(p => p.moderationStatus !== 'rejected').length;

  if (approvedCount >= MAX_PHOTOS) {
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

  // AI moderation
  const moderationResult = await moderateImage(publicUrl);
  const approved = moderationResult.status === 'approved';

  // Create new photo object
  const newPhoto: ProfilePhoto = {
    id: crypto.randomUUID(),
    url: publicUrl,
    storagePath,
    isPrimary: isPrimary || currentPhotos.length === 0,
    approved,
    moderationStatus: moderationResult.status,
    rejectionReason: moderationResult.reason,
    moderationConfidence: moderationResult.confidence,
    moderationFlags: moderationResult.flags,
    moderatedAt: new Date().toISOString(),
    mimeType: file.type,
    fileSizeBytes: file.size,
    uploadedAt: new Date().toISOString()
  };

  // If setting as primary, unset existing primary
  let updatedPhotos = currentPhotos;
  if (newPhoto.isPrimary) {
    updatedPhotos = currentPhotos.map(p => ({ ...p, isPrimary: false }));
  }

  // Add new photo
  updatedPhotos = [...updatedPhotos, newPhoto];

  // Determine primary photo URL
  const primaryPhoto = updatedPhotos.find(p => p.isPrimary && p.approved);
  const primaryPhotoUrl = primaryPhoto?.url || null;

  // Update profile
  await updateProfilePhotos(userId, updatedPhotos, primaryPhotoUrl);

  console.log(`Photo uploaded for user ${userId}: ${newPhoto.id}`);

  return new Response(JSON.stringify({ 
    success: true, 
    photo: {
      id: newPhoto.id,
      url: newPhoto.url,
      isPrimary: newPhoto.isPrimary,
      approved: newPhoto.approved,
      moderationStatus: newPhoto.moderationStatus,
      rejectionReason: newPhoto.rejectionReason,
      moderationConfidence: newPhoto.moderationConfidence,
      moderationFlags: newPhoto.moderationFlags
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDelete(photoId: string, userId: string) {
  // Get current profile photos
  const profile = await getProfile(userId);
  const currentPhotos: ProfilePhoto[] = profile?.photos || [];

  // Find photo to delete
  const photoToDelete = currentPhotos.find(p => p.id === photoId);
  if (!photoToDelete) {
    return new Response(JSON.stringify({ error: 'Photo not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Delete from storage
  await supabase.storage.from('profile-photos').remove([photoToDelete.storagePath]);

  // Remove photo from array
  let updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

  // If deleted photo was primary, set another approved photo as primary
  if (photoToDelete.isPrimary && updatedPhotos.length > 0) {
    const nextApproved = updatedPhotos.find(p => p.approved);
    if (nextApproved) {
      updatedPhotos = updatedPhotos.map(p => ({
        ...p,
        isPrimary: p.id === nextApproved.id
      }));
    }
  }

  // Determine primary photo URL
  const primaryPhoto = updatedPhotos.find(p => p.isPrimary && p.approved);
  const primaryPhotoUrl = primaryPhoto?.url || null;

  // Update profile
  await updateProfilePhotos(userId, updatedPhotos, primaryPhotoUrl);

  console.log(`Photo deleted for user ${userId}: ${photoId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSetPrimary(photoId: string, userId: string) {
  // Get current profile photos
  const profile = await getProfile(userId);
  const currentPhotos: ProfilePhoto[] = profile?.photos || [];

  // Find photo
  const photo = currentPhotos.find(p => p.id === photoId);
  if (!photo) {
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

  // Update primary status
  const updatedPhotos = currentPhotos.map(p => ({
    ...p,
    isPrimary: p.id === photoId
  }));

  // Update profile
  await updateProfilePhotos(userId, updatedPhotos, photo.url);

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

  // Get current profile photos
  const profile = await getProfile(userId);
  const currentPhotos: ProfilePhoto[] = profile?.photos || [];

  // Reorder photos based on new order
  const reorderedPhotos: ProfilePhoto[] = [];
  for (const id of photoIds) {
    const photo = currentPhotos.find(p => p.id === id);
    if (photo) {
      reorderedPhotos.push(photo);
    }
  }

  // Add any photos not in the reorder list (shouldn't happen, but just in case)
  for (const photo of currentPhotos) {
    if (!reorderedPhotos.find(p => p.id === photo.id)) {
      reorderedPhotos.push(photo);
    }
  }

  // Determine primary photo URL
  const primaryPhoto = reorderedPhotos.find(p => p.isPrimary && p.approved);
  const primaryPhotoUrl = primaryPhoto?.url || null;

  // Update profile
  await updateProfilePhotos(userId, reorderedPhotos, primaryPhotoUrl);

  console.log(`Photos reordered for user ${userId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleList(userId: string) {
  const profile = await getProfile(userId);
  const photos: ProfilePhoto[] = profile?.photos || [];

  return new Response(JSON.stringify({ 
    photos: photos.map((p, index) => ({
      id: p.id,
      url: p.url,
      isPrimary: p.isPrimary,
      approved: p.approved,
      moderationStatus: p.moderationStatus,
      rejectionReason: p.rejectionReason,
      moderationConfidence: p.moderationConfidence,
      moderationFlags: p.moderationFlags,
      displayOrder: index + 1
    }))
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}