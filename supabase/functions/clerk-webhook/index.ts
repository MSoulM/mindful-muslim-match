//@ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.21.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET");
if (!CLERK_WEBHOOK_SECRET) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}
console.log(CLERK_WEBHOOK_SECRET);
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
    console.log(event.data);
    if (event.type !== "user.created" && event.type !== "user.updated" && event.type !== "user.deleted") {
      return new Response("Event ignored", {
        status: 200
      });
    }
    const user = event.data;
    const profile = {
      clerk_user_id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      updated_at: new Date().toISOString()
    };
    if (event.type === "user.created") {
      const { data: existingProfile, error: checkError } = await supabase.from("profiles").select("clerk_user_id").eq("clerk_user_id", user.id).maybeSingle();
      if (checkError) {
        return new Response("Check failed", {
          status: 500
        });
      } else if (existingProfile) {
        return new Response("User created but profile already existed", {
          status: 200
        });
      }
      const { error } = await supabase.from("profiles").insert(profile);
    } else if (event.type === "user.deleted") {
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);
      if (error) {
        console.error("Supabase delete failed:", error);
        return new Response("Database error", {
          status: 500
        });
      }
    }
    return new Response("Success", {
      status: 200
    });
  } catch (err) {
    console.error(err);
    return new Response("Error", {
      status: 500
    });
  }
});
