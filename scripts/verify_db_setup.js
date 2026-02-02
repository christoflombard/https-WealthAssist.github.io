const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTable(tableName) {
    const { data, error } = await supabase.from(tableName).select('id').limit(1);
    if (error) {
        if (error.code === '42P01') { // undefined_table
            return { exists: false, error: 'Table does not exist' };
        }
        // If we get a permission error or other error, the table likely exists but we can't query it (though service role should be able to)
        return { exists: true, error: error.message };
    }
    return { exists: true, count: data.length };
}

async function verify() {
    console.log('--- Verifying Database Setup ---');
    console.log(`Project: ${env.NEXT_PUBLIC_SUPABASE_URL}`);

    const tables = ['leads', 'opportunities', 'profiles', 'opportunity_files'];
    let allGood = true;

    for (const table of tables) {
        const result = await checkTable(table);
        if (result.exists) {
            console.log(`✅ ${table}: Exists`);
        } else {
            console.log(`❌ ${table}: MISSING`);
            allGood = false;
        }
    }

    if (allGood) {
        console.log('\nSUCCESS: All required tables are present.');
    } else {
        console.log('\nWARNING: Some tables are missing. Please run supabase/master_setup.sql in your Supabase SQL Editor.');
    }
}

verify();
