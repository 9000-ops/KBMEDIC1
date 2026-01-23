
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTable() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        await client.query(`DROP TABLE IF EXISTS settings;`);

        await client.query(`
      CREATE TABLE settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT
      );
    `);

        console.log('Settings table created successfully');

        // Insert some default values if not exists
        await client.query(`
      INSERT INTO settings (key, value) VALUES
      ('site_name', 'KB-Medic'),
      ('hero_title', 'Votre santé, notre priorité'),
      ('hero_subtitle', 'Découvrez une large gamme de produits médicaux avec livraison rapide à domicile'),
      ('contact_email', 'contact@kb-medic.com'),
      ('contact_phone', '+213 555 123 456')
      ON CONFLICT (key) DO NOTHING;
    `);

        console.log('Default settings inserted');
        client.release();
        pool.end();
    } catch (err) {
        console.error('Error creating table:', err);
        pool.end();
    }
}

createTable();
