/**
 * Test script to verify database connection and API functionality
 */

const db = require('./database');

async function testDatabase() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Testing Database Connection & API                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // Test 1: Basic connection
        console.log('1. Testing database connection...');
        const result = await db.query('SELECT NOW()');
        console.log('   ✓ Connected to database');
        console.log('   Server time:', result.rows[0].now);

        // Test 2: Check orders table
        console.log('\n2. Checking orders table...');
        const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders');
        console.log('   ✓ Orders table exists');
        console.log('   Total orders:', ordersResult.rows[0].count);

        // Test 3: Check users table
        console.log('\n3. Checking users table...');
        const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
        console.log('   ✓ Users table exists');
        console.log('   Total users:', usersResult.rows[0].count);

        // Test 4: Check products table
        console.log('\n4. Checking products table...');
        const productsResult = await db.query('SELECT COUNT(*) as count FROM products');
        console.log('   ✓ Products table exists');
        console.log('   Total products:', productsResult.rows[0].count);

        // Test 5: List recent orders
        console.log('\n5. Recent orders:');
        const recentOrders = await db.query(`
            SELECT o.id, o.total, o.status, o.customer_name, o.created_at, u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);
        
        if (recentOrders.rows.length === 0) {
            console.log('   No orders found');
        } else {
            recentOrders.rows.forEach(order => {
                console.log(`   #${order.id} - ${order.customer_name || order.user_name} - ${order.total} دج - ${order.status}`);
            });
        }

        // Test 6: List users
        console.log('\n6. Users:');
        const users = await db.query('SELECT id, name, email, role FROM users ORDER BY id LIMIT 10');
        users.rows.forEach(user => {
            console.log(`   #${user.id} - ${user.name} (${user.email}) - ${user.role}`);
        });

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║     All tests passed successfully!                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

testDatabase();
