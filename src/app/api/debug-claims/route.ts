import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon key to simulate client-side

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    // NOTE: This uses ANON key, so RLS applies. 
    // If we are not logged in, we shouldn't see anything if RLS is correct for non-authed.
    // But we want to simulate the admin query. 
    // Since we can't easily generate an auth token here for the admin user without their password,
    // We might need to use SERVICE_ROLE_KEY to see what is actually in the DB first, 
    // then check why ANON (authenticated) might fail.

    // Actually, let's use SERVICE_ROLE_KEY if available (user didn't put it in env file likely), 
    // so let's try to just dump *all* claims to see if they exist.
    // If user didn't add SERVICE_KEY, we will use ANON key but we won't be able to see much unless checks are loose.

    // Wait, user declined adding SERVICE_KEY. So I have to use ANON.
    // But ANON key without a user session (token) will be "anon" role.
    // Admin policies require "authenticated" role + admin profile.

    // So curl request to this route won't have the user's session.
    // This debug route is of limited use for RLS testing unless I can pass a token.

    // ALTERNATIVE: Use the code to query with a hardcoded select of just "count" or similar to see if strictly the JOIN is failing.

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if any claims exist at all (might fail if RLS blocks anon)
    const { data: claims, error } = await supabase
        .from("claims")
        .select("*");

    return NextResponse.json({
        info: "Querying with ANON key (no user session)",
        claims,
        error: error ? error.message : null
    });
}
