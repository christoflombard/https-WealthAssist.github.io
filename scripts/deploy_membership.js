const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract password properly (likely "4Th3K1ngd0m!")
const connectionString = 'postgresql://postgres:4Th3K1ngd0m!@db.nfqcnhdtqekjfygquqft.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        const sqlPath = path.join(__dirname, '../supabase/schema_membership.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running schema_membership.sql...');
        await client.query(sql);
        console.log('✅ Membership Schema executed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
