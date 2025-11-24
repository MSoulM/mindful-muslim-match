//@ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://esm.sh/svix@1.21.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;

if (!CLERK_WEBHOOK_SECRET) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set");
}

serve(async (req) => {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    try {
      await verify(payload, headers, CLERK_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(payload);

    if (event.type !== "user.created" && event.type !== "user.updated" && event.type !== "user.deleted") {
      return new Response("Event ignored", { status: 200 });
    }

    const user = event.data;

    const profile = {
      clerk_user_id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      updated_at: new Date().toISOString(),
    };

    if (event.type === "user.created" || event.type === "user.updated") {
      const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
      if (error) {
        console.error("Supabase upsert failed:", error);
        return new Response("Database error", { status: 500 })
      }
    } else if (event.type === "user.deleted") {
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);

      if (error) {
        console.error("Supabase delete failed:", error);
        return new Response("Database error", { status: 500 });
      }
    }

    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});