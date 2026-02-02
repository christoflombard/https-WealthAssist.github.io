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

        const sqlPath = path.join(__dirname, '../supabase/master_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running master_setup.sql...');
        await client.query(sql);
        console.log('✅ Migration executed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
