import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.investment_amount) {
            return NextResponse.json(
                { error: 'Title and Investment Amount are required' },
                { status: 400 }
            );
        }

        const supabase = await createServiceRoleClient();

        const { data, error } = await supabase
            .from('opportunities')
            .insert({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createServiceRoleClient();

        // 1. Check User Auth & Tier
        // We need to parse the cookie from the request to know who the user is.
        // But this is an API route called by the client. 
        // We should use createServerClient to get the user context.

        // Actually, let's use the standard createServerSupabaseClient pattern (if available) or just check headers.
        // Ideally, we import { createServerClient } from '@supabase/ssr' etc.
        // But we have 'lib/supabase/server.ts'. Let's use `createServerSupabaseClient` for auth check.
    } catch (e) {
        // ...
    }
}
// wait, I need to see imports first to do this right.
// The file currently uses `createServiceRoleClient`.
// I need `createServerSupabaseClient` to check the current user's session.

