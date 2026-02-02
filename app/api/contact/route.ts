import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, interest } = body;

        // 1. Validation
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and Email are required' },
                { status: 400 }
            );
        }

        // 2. Insert into Supabase (using Service Role for full access)
        const supabase = await createServiceRoleClient();
        const { data: leadData, error: dbError } = await (supabase as any)
            .from('leads')
            .insert({
                name,
                email,
                message,
                interest,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database Error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save lead' },
                { status: 500 }
            );
        }

        // 3. Send to GoHighLevel (if Webhook URL is configured)
        const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
        let ghlStatus = 'skipped';

        if (ghlWebhookUrl) {
            try {
                // Construct the payload for GHL
                // You can customize this payload based on what your GHL workflow expects
                const ghlPayload = {
                    name,
                    email,
                    message,
                    tags: interest === 'investor' ? ['investor-interest'] : interest === 'owner' ? ['property-owner-interest'] : ['website-lead'],
                    source: 'wealthassist-website',
                    customData: {
                        interest_path: interest,
                        db_id: leadData.id
                    }
                };

                const ghlResponse = await fetch(ghlWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ghlPayload),
                });

                if (ghlResponse.ok) {
                    ghlStatus = 'success';
                } else {
                    console.error('GHL Webhook Failed:', ghlResponse.status, await ghlResponse.text());
                    ghlStatus = 'failed';
                }
            } catch (ghlError) {
                console.error('GHL Connection Error:', ghlError);
                ghlStatus = 'error';
            }
        }

        return NextResponse.json({
            success: true,
            lead: leadData,
            ghl_integration: ghlStatus
        });

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
