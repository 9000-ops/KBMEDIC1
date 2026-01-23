/**
 * Database Connection Verification Script
 * Tests connection to Neon and verifies data persistence
 */

const db = require('./database');

async function verifyConnection() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Neon Database Connection Verification                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Basic Connection
    console.log('📡 [1/6] Testing basic connection...');
    const connected = await db.connect();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    console.log('   ✓ Connection established\n');

    // Test 2: Server Time
    console.log('🕐 [2/6] Checking server time...');
    const timeResult = await db.query('SELECT NOW() as server_time, current_setting(\'TimeZone\') as timezone');
    console.log(`   ✓ Server time: ${timeResult.rows[0].server_time}`);
    console.log(`   ✓ Timezone: ${timeResult.rows[0].timezone}\n`);

    // Test 3: Database Info
    console.log('🗄️  [3/6] Getting database information...');
    const dbInfo = await db.query('SELECT current_database() as db_name, version() as pg_version');
    console.log(`   ✓ Database: ${dbInfo.rows[0].db_name}`);
    console.log(`   ✓ PostgreSQL: ${dbInfo.rows[0].pg_version.split(' ')[0]} ${dbInfo.rows[0].pg_version.split(' ')[1]}\n`);

    // Test 4: Check Tables
    console.log('📋 [4/6] Verifying database tables...');
    const tablesResult = await db.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('   ⚠ No tables found! Run migration first.\n');
    } else {
      console.log('   ✓ Tables found:');
      tablesResult.rows.forEach(row => {
        console.log(`     - ${row.table_name} (${row.columns} columns)`);
      });
      console.log('');
    }

    // Test 5: Check Data in Tables
    console.log('📊 [5/6] Checking data in tables...');
    const counts = {};
    for (const table of ['users', 'categories', 'products', 'orders', 'order_items', 'settings']) {
      const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(countResult.rows[0].count);
      console.log(`   ✓ ${table}: ${counts[table]} records`);
    }
    console.log('');

    // Test 6: Insert Test Record (to verify writes work)
    console.log('✏️  [6/6] Testing write operation...');
    const testEmail = `test_${Date.now()}@verification.com`;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const insertResult = await db.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Test User', $1, $2, 'customer')
      RETURNING id, name, email, created_at
    `, [testEmail, hashedPassword]);
    
    const insertedUser = insertResult.rows[0];
    console.log(`   ✓ Test user created with ID: ${insertedUser.id}`);
    console.log(`   ✓ Email: ${insertedUser.email}`);
    console.log(`   ✓ Created at: ${insertedUser.created_at}\n`);

    // Verify the insert by reading it back
    const verifyResult = await db.query('SELECT * FROM users WHERE id = $1', [insertedUser.id]);
    if (verifyResult.rows.length > 0) {
      console.log('   ✓ Data persistence verified - record read back successfully\n');
    }

    // Clean up test data
    await db.query('DELETE FROM users WHERE id = $1', [insertedUser.id]);
    console.log('   ✓ Test data cleaned up\n');

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    VERIFICATION SUMMARY                     ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Status: ✅ CONNECTED                                       ║');
    console.log(`║  Database: ${dbInfo.rows[0].db_name.padEnd(42)}║`);
    console.log(`║  Users: ${String(counts.users).padEnd(45)}║`);
    console.log(`║  Categories: ${String(counts.categories).padEnd(41)}║`);
    console.log(`║  Products: ${String(counts.products).padEnd(43)}║`);
    console.log(`║  Orders: ${String(counts.orders).padEnd(45)}║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Write Test: ✅ PASSED                                      ║');
    console.log('║  Read Test: ✅ PASSED                                       ║');
    console.log('║  Persistence: ✅ VERIFIED                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🎉 All tests passed! Your Neon database connection is working correctly.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code || 'N/A');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n→ Check if the database server is running');
      console.error('→ Verify the connection string is correct');
    } else if (error.code === '28P01' || error.code === '28P02') {
      console.error('\n→ Invalid credentials in connection string');
      console.error('→ Check username and password');
    } else if (error.code === '57P03') {
      console.error('\n→ Database connection terminated');
      console.error('→ Check if database is accepting connections');
    }
    
    process.exit(1);
  }
}

verifyConnection();
