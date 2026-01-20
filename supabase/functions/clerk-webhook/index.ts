//@ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.21.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET");
if (!CLERK_WEBHOOK_SECRET) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}

/**
 * Extract phone verification status from Clerk user object
 * Checks phone_numbers array and primary_phone_number_id to determine if phone is verified
 * @param user - Clerk user object from webhook event
 * @returns Object with phoneVerified boolean
 */
function extractPhoneVerificationStatus(user: any) {
  const phoneNumbers = user.phone_numbers || [];
  const primaryPhoneNumberId = user.primary_phone_number_id;
  
  // Log phone numbers array info (dev-only, mask phone numbers)
  if (Deno.env.get("DENO_ENV") === "development") {
    console.log(`[WEBHOOK] Phone numbers array length: ${phoneNumbers.length}`);
    console.log(`[WEBHOOK] Primary phone number ID: ${primaryPhoneNumberId || 'none'}`);
  }
  
  // Find the primary phone number or any verified phone number
  let phoneVerified = false;
  let primaryPhone = null;
  
  if (primaryPhoneNumberId) {
    primaryPhone = phoneNumbers.find((pn: any) => pn.id === primaryPhoneNumberId);
  }
  
  // If no primary phone, check if any phone is verified
  if (!primaryPhone && phoneNumbers.length > 0) {
    primaryPhone = phoneNumbers.find((pn: any) => pn.verification?.status === "verified");
  }
  
  // If still no phone found, use first phone number
  if (!primaryPhone && phoneNumbers.length > 0) {
    primaryPhone = phoneNumbers[0];
  }
  
  // Check verification status
  if (primaryPhone) {
    phoneVerified = primaryPhone.verification?.status === "verified" || false;
    
    if (Deno.env.get("DENO_ENV") === "development") {
      // Mask phone number for logging (show only last 4 digits)
      const phoneNumber = primaryPhone.phone_number || '';
      const maskedPhone = phoneNumber.length > 4 
        ? `${phoneNumber.slice(0, -4).replace(/\d/g, '*')}${phoneNumber.slice(-4)}`
        : '****';
      console.log(`[WEBHOOK] Phone number: ${maskedPhone}, Verified: ${phoneVerified}`);
    }
  } else {
    if (Deno.env.get("DENO_ENV") === "development") {
      console.log(`[WEBHOOK] No phone number found for user`);
    }
  }
  
  return { phoneVerified };
}

/**
 * Extract email verification status from Clerk user object
 * Checks email_addresses array and primary_email_address_id to determine if email is verified
 * @param user - Clerk user object from webhook event
 * @returns Object with emailVerified boolean
 */
function extractEmailVerificationStatus(user: any) {
  const emailAddresses = user.email_addresses || [];
  const primaryEmailAddressId = user.primary_email_address_id;
  
  // Log email addresses array info (dev-only, mask email addresses)
  if (Deno.env.get("DENO_ENV") === "development") {
    console.log(`[WEBHOOK] Email addresses array length: ${emailAddresses.length}`);
    console.log(`[WEBHOOK] Primary email address ID: ${primaryEmailAddressId || 'none'}`);
  }
  
  // Find the primary email address or any verified email address
  let emailVerified = false;
  let primaryEmail = null;
  
  if (primaryEmailAddressId) {
    primaryEmail = emailAddresses.find((ea: any) => ea.id === primaryEmailAddressId);
  }
  
  // If no primary email, check if any email is verified
  if (!primaryEmail && emailAddresses.length > 0) {
    primaryEmail = emailAddresses.find((ea: any) => ea.verification?.status === "verified");
  }
  
  // If still no email found, use first email address
  if (!primaryEmail && emailAddresses.length > 0) {
    primaryEmail = emailAddresses[0];
  }
  
  // Check verification status
  if (primaryEmail) {
    emailVerified = primaryEmail.verification?.status === "verified" || false;
    
    if (Deno.env.get("DENO_ENV") === "development") {
      // Mask email address for logging (show only first 2 chars and domain)
      const emailAddress = primaryEmail.email_address || '';
      if (emailAddress) {
        const [localPart, domain] = emailAddress.split('@');
        const maskedLocal = localPart.length > 2 
          ? `${localPart.slice(0, 2)}${'*'.repeat(Math.min(localPart.length - 2, 4))}`
          : '**';
        const maskedEmail = domain 
          ? `${maskedLocal}@${domain}`
          : maskedLocal;
        console.log(`[WEBHOOK] Email address: ${maskedEmail}, Verified: ${emailVerified}`);
      }
    }
  } else {
    if (Deno.env.get("DENO_ENV") === "development") {
      console.log(`[WEBHOOK] No email address found for user`);
    }
  }
  
  return { emailVerified };
}

/**
 * Extract both phone and email verification status from Clerk user object
 * @param user - Clerk user object from webhook event
 * @returns Object with phoneVerified and emailVerified booleans
 */
function extractVerificationStatus(user: any) {
  const { phoneVerified } = extractPhoneVerificationStatus(user);
  const { emailVerified } = extractEmailVerificationStatus(user);
  return { phoneVerified, emailVerified };
}

serve(async (req)=>{
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    let event;
    try {
      const wh = new Webhook(CLERK_WEBHOOK_SECRET);
      event = wh.verify(payload, {
        "svix-id": headers["svix-id"],
        "svix-timestamp": headers["svix-timestamp"],
        "svix-signature": headers["svix-signature"]
      });
    } catch (err) {
      console.error("Invalid Clerk webhook signature:", err);
      return new Response("Unauthorized", {
        status: 401
      });
    }
    
    // Log event type for debugging
    if (Deno.env.get("DENO_ENV") === "development") {
      console.log(`[WEBHOOK] Event type: ${event.type}`);
    }
    
    if (event.type !== "user.created" && event.type !== "user.updated" && event.type !== "user.deleted") {
      return new Response("Event ignored", {
        status: 200
      });
    }
    
    const user = event.data;
    
    if (event.type === "user.created") {
      const { phoneVerified, emailVerified } = extractVerificationStatus(user);
      
      const profile = {
        clerk_user_id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_verified: phoneVerified,
        email_verified: emailVerified,
        updated_at: new Date().toISOString()
      };
      
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("clerk_user_id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Supabase check failed:", checkError);
        return new Response("Check failed", {
          status: 500
        });
      } else if (existingProfile) {
        return new Response("User created but profile already existed", {
          status: 200
        });
      }
      
      const { error, data } = await supabase.from("profiles").insert(profile).select();
      
      if (error) {
        console.error("Supabase insert failed:", error);
        return new Response("Database error", {
          status: 500
        });
      }
      
      if (Deno.env.get("DENO_ENV") === "development") {
        console.log(`[WEBHOOK] Profile created for user ${user.id}, phone_verified: ${phoneVerified}, email_verified: ${emailVerified}`);
      }
      
      return new Response("Success", {
        status: 200
      });
      
    } else if (event.type === "user.updated") {
      // Extract phone and email verification status from updated user
      const { phoneVerified, emailVerified } = extractVerificationStatus(user);
      
      // Update profile with verification status
      const updateData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_verified: phoneVerified,
        email_verified: emailVerified,
        updated_at: new Date().toISOString()
      };
      
      const { error, data, count } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("clerk_user_id", user.id)
        .select();
      
      if (error) {
        console.error("Supabase update failed:", error);
        return new Response("Database error", {
          status: 500
        });
      }
      
      if (!data || data.length === 0) {
        console.error(`[WEBHOOK] No profile found to update for clerk_user_id: ${user.id}`);
        // Profile might not exist yet - create it
        const profile = {
          clerk_user_id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone_verified: phoneVerified,
          email_verified: emailVerified,
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase.from("profiles").insert(profile);
        
        if (insertError) {
          console.error("Supabase insert failed during user.updated:", insertError);
          return new Response("Database error", {
            status: 500
          });
        }
        
        if (Deno.env.get("DENO_ENV") === "development") {
          console.log(`[WEBHOOK] Profile created during user.updated for user ${user.id}, phone_verified: ${phoneVerified}, email_verified: ${emailVerified}`);
        }
      } else {
        if (Deno.env.get("DENO_ENV") === "development") {
          console.log(`[WEBHOOK] Profile updated for user ${user.id}, phone_verified: ${phoneVerified}, email_verified: ${emailVerified}, rows affected: ${data.length}`);
        }
      }
      
      return new Response("Success", {
        status: 200
      });
      
    } else if (event.type === "user.deleted") {
      const { error } = await supabase.from("profiles").delete().eq("clerk_user_id", user.id);
      
      if (error) {
        console.error("Supabase delete failed:", error);
        return new Response("Database error", {
          status: 500
        });
      }
      
      return new Response("Success", {
        status: 200
      });
    }
    
    return new Response("Success", {
      status: 200
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Error", {
      status: 500
    });
  }
});
