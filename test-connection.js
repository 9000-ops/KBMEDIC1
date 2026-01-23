/**
 * Test Database Connection Script
 * Tests connection to Neon PostgreSQL database
 */

const db = require('./database');

async function testConnection() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Testing Neon Database Connection                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test basic connection
    const connected = await db.connect();
    if (connected) {
      console.log('✓ Database connection successful!\n');

      // Test simple query
      const result = await db.query('SELECT NOW() as current_time');
      console.log('✓ Server time:', result.rows[0].current_time);

      // Test table existence
      const tablesResult = await db.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      console.log('\nExisting tables:');
      if (tablesResult.rows.length > 0) {
        tablesResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      } else {
        console.log('  No tables found (run migration to create them)');
      }

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║     Connection test completed successfully!               ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      process.exit(0);
    }
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('\nError details:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);

    if (error.message.includes('password authentication failed')) {
      console.error('\n→ Check your connection string credentials');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n→ Check if the database server is running');
    } else if (error.message.includes('ssl')) {
      console.error('\n→ Check SSL configuration');
    }

    process.exit(1);
  }
}

testConnection();
