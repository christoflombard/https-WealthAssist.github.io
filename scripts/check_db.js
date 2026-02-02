const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOpportunities() {
    console.log('Checking opportunities table...');
    const { data, error } = await supabase
        .from('opportunities')
        .select('id')
        .limit(1);

    if (error) {
        console.error('Error fetching opportunities:', error.message);
        // Specifically look for "relation does not exist" which means table missing
        if (error.message.includes('relation "public.opportunities" does not exist')) {
            console.error('FAIL: Table `opportunities` DOES NOT EXIST.');
        } else {
            console.error('FAIL: Database connection worked but query failed.');
        }
    } else {
        console.log('SUCCESS: Table `opportunities` exists!');
        console.log('Row count check:', data.length);
    }
}

checkOpportunities();
